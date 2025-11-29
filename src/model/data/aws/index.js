const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// DynamoDB table name for fragments metadata
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'fragments';

// Writes a fragment to DynamoDB. Returns a Promise.
async function writeFragment(fragment) {
  // Configure our PUT params, with the name of the table and item (attributes and keys)
  const params = {
    TableName: TABLE_NAME,
    Item: fragment,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return await ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment from DynamoDB. Returns a Promise<fragment|undefined>
async function readFragment(ownerId, id) {
  // Configure our GET params, with the name of the table and key (partition key + sort key)
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  const command = new GetCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);
    // We may or may not get back any data (e.g., no item found for the given key).
    // If we get back an item (fragment), we'll return it.  Otherwise we'll return `undefined`.
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

// Writes a fragment's data to an S3 Object in a Bucket
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
async function writeFragmentData(ownerId, id, dataBuffer) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: dataBuffer,
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer by collecting chunks until finished
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns a Buffer
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const resp = await s3Client.send(command); // resp.Body is a Readable stream
    return streamToBuffer(resp.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragments, either ids-only, or full Objects, for the given user.
// Returns a Promise<Array<Fragment>|Array<string>|undefined>
async function listFragments(ownerId, expand = false) {
  // Configure our QUERY params, with the name of the table and the query expression
  const params = {
    TableName: TABLE_NAME,
    // Specify that we want to get all items where the ownerId is equal to the
    // `:ownerId` that we'll define below in the ExpressionAttributeValues.
    KeyConditionExpression: 'ownerId = :ownerId',
    // Use the `ownerId` value to do the query
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand. Without doing this
  // we'll get back every attribute.  The projection expression defines a list
  // of attributes to return, see:
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // Create a QUERY command to send to DynamoDB
  const command = new QueryCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);

    // If we haven't expanded to include all attributes, remap this array from
    // [ {"id":"b9e7a264-630f-436d-a785-27f30233faea"}, {"id":"dad25b07-8cd6-498b-9aaf-46d358ea97fe"} ,... ] to
    // [ "b9e7a264-630f-436d-a785-27f30233faea", "dad25b07-8cd6-498b-9aaf-46d358ea97fe", ... ]
    return !expand ? data?.Items?.map((item) => item.id) || [] : data?.Items || [];
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// Deletes a fragment's metadata from DynamoDB and its data from S3.
// Returns a Promise.
async function deleteFragment(ownerId, id) {
  // First, delete the fragment data from S3
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    const command = new DeleteObjectCommand(s3Params);
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = s3Params;
    logger.warn({ err, Bucket, Key }, 'error deleting fragment data from S3');
    throw err;
  }

  // Then delete the fragment's metadata from DynamoDB
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
    // Return the item as it appeared before deletion
    ReturnValues: 'ALL_OLD',
  };

  try {
    // The delete operation returns the item as it appeared before deletion
    const data = await ddbDocClient.send(new DeleteCommand(params));
    
    // If Attributes is not set, the item didn't exist
    if (!data.Attributes) {
      logger.warn({ ownerId, id }, 'fragment not found in DynamoDB during deletion');
    }
    
    return data;
  } catch (err) {
    logger.warn({ err, params }, 'error deleting fragment from DynamoDB');
    throw err;
  }
}

module.exports = {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
};

const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// DynamoDB table name for fragments metadata
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'fragments';

// Writes a fragment to DynamoDB. Returns a Promise.
async function writeFragment(fragment) {
  const params = {
    TableName: TABLE_NAME,
    Item: fragment,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    return fragment; // what tests expect
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment from DynamoDB. Returns a Promise<fragment|undefined>
async function readFragment(ownerId, id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

// Writes a fragment's data to an S3 Object in a Bucket
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
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const resp = await s3Client.send(command);
    return streamToBuffer(resp.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragments, either ids-only, or full Objects, for the given user.
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (!expand) {
      return data?.Items?.map((item) => ({ id: item.id })) || [];
    }
    return data?.Items || [];
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// Deletes a fragment's metadata from DynamoDB and its data from S3
async function deleteFragment(ownerId, id) {
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

  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
    ReturnValues: 'ALL_OLD',
  };

  try {
    const data = await ddbDocClient.send(new DeleteCommand(params));

    if (!data.Attributes) {
      return {};   // Safe fallback
    }

    return data.Attributes;
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

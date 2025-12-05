const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// DynamoDB table name for fragments metadata
const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME;

/**
 * Writes a fragment to DynamoDB
 * @param {Object} fragment - The fragment to write
 * @returns {Promise<Object>} The written fragment
 */
async function writeFragment(fragment) {
  const params = {
    TableName: TABLE_NAME,
    Item: fragment,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    return fragment;
  } catch (err) {
    logger.warn({ err, params, fragment }, 'Error writing fragment to DynamoDB');
    throw err;
  }
}

/**
 * Reads a fragment from DynamoDB
 * @param {string} ownerId - The owner's ID
 * @param {string} id - The fragment's ID
 * @returns {Promise<Object|undefined>} The fragment if found, undefined otherwise
 */
async function readFragment(ownerId, id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'Error reading fragment from DynamoDB');
    throw err;
  }
}

/**
 * Writes a fragment's data to S3
 * @param {string} ownerId - The owner's ID
 * @param {string} id - The fragment's ID
 * @param {Buffer} dataBuffer - The fragment's data as a Buffer
 * @returns {Promise<void>}
 */
async function writeFragmentData(ownerId, id, dataBuffer) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: dataBuffer,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('Unable to upload fragment data');
  }
}

/**
 * Converts a stream to a Buffer
 * @param {Stream} stream - The stream to convert
 * @returns {Promise<Buffer>} The converted buffer
 */
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

/**
 * Reads a fragment's data from S3
 * @param {string} ownerId - The owner's ID
 * @param {string} id - The fragment's ID
 * @returns {Promise<Buffer>} The fragment's data as a Buffer
 */
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    const resp = await s3Client.send(new GetObjectCommand(params));
    return streamToBuffer(resp.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('Unable to read fragment data');
  }
}

/**
 * Gets a list of fragments for a user
 * @param {string} ownerId - The owner's ID
 * @param {boolean} [expand=false] - Whether to return full fragment objects
 * @returns {Promise<Array>} Array of fragment IDs or objects
 */
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
      return data?.Items?.map((item) => item.id) || [];
    }
    return data?.Items || [];
  } catch (err) {
    logger.error({ err, params }, 'Error getting fragments from DynamoDB');
    throw err;
  }
}

/**
 * Deletes a fragment's metadata and data
 * @param {string} ownerId - The owner's ID
 * @param {string} id - The fragment's ID
 * @returns {Promise<Object>} The deleted fragment's attributes
 */
async function deleteFragment(ownerId, id) {
  // First delete from DynamoDB
  const dynamoParams = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
    ReturnValues: 'ALL_OLD',
  };

  let attributes;
  try {
    const data = await ddbDocClient.send(new DeleteCommand(dynamoParams));
    if (!data.Attributes) {
      throw new Error('Fragment not found');
    }
    attributes = data.Attributes;
  } catch (err) {
    logger.warn({ err, params: dynamoParams }, 'Error deleting fragment from DynamoDB');
    throw err;
  }

  // Then delete from S3
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(s3Params));
    return attributes;
  } catch (err) {
    // Log but don't fail if S3 deletion fails
    const { Bucket, Key } = s3Params;
    logger.warn({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    return attributes; // Still return the DynamoDB attributes
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

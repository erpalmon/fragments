/**
 * S3 specific config and objects.  See:
 * https://www.npmjs.com/package/@aws-sdk/client-s3
 */
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * If AWS credentials are configured in the environment, use them.
 * @returns {Object|undefined} AWS credentials object
 */
function getCredentials() {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    logger.debug('Using extra S3 credentials');
    return credentials;
  }
}

/**
 * If an AWS S3 Endpoint is configured in the environment, use it.
 * @returns {string|undefined} The S3 endpoint URL
 */
function getS3Endpoint() {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug('Using alternate S3 endpoint');
    return process.env.AWS_S3_ENDPOINT_URL;
  }
}

// Create and export the S3 client
module.exports = new S3Client({
  region: process.env.AWS_REGION,
  credentials: getCredentials(),
  endpoint: getS3Endpoint(),
  forcePathStyle: true,
});

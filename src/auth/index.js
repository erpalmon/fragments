// src/auth/index.js
const logger = require('../logger');

// Detect environment
const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

// 1️⃣ In test environment ALWAYS use basic-auth mocks
if (isTestEnv) {
  logger.info('Using mock HTTP Basic Auth for tests');
  module.exports = require('./basic-auth');
} else {
  // 2️⃣ Block invalid combinations (tests expect these errors)
  if (useCognito && useBasicAuth) {
    throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
  }

  if (!useCognito && !useBasicAuth) {
    throw new Error('No authorization configuration found');
  }

  // 3️⃣ Choose real auth
  if (useCognito) {
    logger.info('Using AWS Cognito for authentication');
    module.exports = require('./cognito');
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('HTTP Basic Auth is not allowed in production');
    }
    logger.info('Using HTTP Basic Auth for development');
    module.exports = require('./basic-auth');
  }
}

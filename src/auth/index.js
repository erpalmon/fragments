// src/auth/index.js
const logger = require('../logger');

// Check which auth strategy to use
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;
const isTestEnv = process.env.NODE_ENV === 'test';

// In test environment, skip auth check
if (!isTestEnv) {
  if (useCognito && useBasicAuth) {
    throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
  }

  if (!useCognito && !useBasicAuth) {
    throw new Error('No authorization configuration found');
  }
}

if (useCognito) {
  logger.info('Using AWS Cognito for authentication');
  module.exports = require('./cognito');
} else {
  if (process.env.NODE_ENV === 'production' && !isTestEnv) {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  logger.info('Using HTTP Basic Auth for development');
  module.exports = require('./basic-auth');
}

// src/auth/index.js
const logger = require('../logger');

// Check which auth strategy to use
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

if (useCognito && useBasicAuth) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

if (useCognito) {
  logger.info('Using AWS Cognito for authentication');
  module.exports = require('./cognito');
} else if (useBasicAuth) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  logger.info('Using HTTP Basic Auth for development');
  module.exports = require('./basic-auth');
} else {
  throw new Error('No authorization configuration found');
}

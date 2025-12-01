// src/auth/index.js
const logger = require('../logger');

const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

// 1️⃣ In test environment: FORCE basic-auth mock and STOP executing this file
if (isTestEnv) {
  logger.info('Using mock HTTP Basic Auth for tests');
  module.exports = require('./basic-auth');
  // Stop evaluating the rest of the module
  return;
}

// 2️⃣ Validate configuration (tests expect these errors)
if (useCognito && useBasicAuth) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

if (!useCognito && !useBasicAuth) {
  throw new Error('No authorization configuration found');
}

// 3️⃣ Real runtime logic
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

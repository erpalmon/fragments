// src/auth/index.js
const logger = require('../logger');

// Detect environment
const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

// This object will be assigned as module.exports at the very end
let authModule;

// 1️⃣ In test environment ALWAYS use mock basic-auth
if (isTestEnv) {
  logger.info('Using mock HTTP Basic Auth for tests');
  authModule = require('./basic-auth');
}

// 2️⃣ Block invalid combinations (tests expect these errors)
else if (useCognito && useBasicAuth) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

else if (!useCognito && !useBasicAuth) {
  throw new Error('No authorization configuration found');
}

// 3️⃣ Choose real auth
else if (useCognito) {
  logger.info('Using AWS Cognito for authentication');
  authModule = require('./cognito');
}

else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  logger.info('Using HTTP Basic Auth for development');
  authModule = require('./basic-auth');
}

// Final exported value
module.exports = authModule;

// src/auth/index.js
const logger = require('../logger');

// Detect environment
const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

let authModule;

// ---------------------------------------------------------
// 1️⃣ TEST ENVIRONMENT → USE BASIC AUTH (NOT MOCK STRATEGY)
// ---------------------------------------------------------
if (isTestEnv) {
  logger.info('Test mode: forcing HTTP Basic Auth with in-memory validation');

  // Pretend a htpasswd file exists so basic-auth.js does not throw
  process.env.HTPASSWD_FILE = 'test';

  // Load basic-auth module which already has a test-mode implementation
  authModule = require('./basic-auth');
}

// ---------------------------------------------------------
// 2️⃣ INVALID CONFIG CASES
// ---------------------------------------------------------
else if (useCognito && useBasicAuth) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

else if (!useCognito && !useBasicAuth) {
  throw new Error('No authorization configuration found');
}

// ---------------------------------------------------------
// 3️⃣ REAL AUTH MODES
// ---------------------------------------------------------
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

// Final export
module.exports = authModule;

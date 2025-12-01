// src/auth/index.js
const logger = require('../logger');
const { Strategy } = require('passport-strategy');

// Detect environment
const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

let authModule;

// ---------------------------------------------------------
// 1️⃣ TEST ENVIRONMENT → provide a REAL Passport Strategy
// ---------------------------------------------------------
if (isTestEnv) {
  logger.info('Using mock HTTP Basic Auth for tests');

  class MockStrategy extends Strategy {
    constructor() {
      super();
      this.name = 'http';
    }

    authenticate(req) {
      const mode = req.headers['x-test-auth'];

      if (mode === 'error') {
        return this.error(new Error('Test error'));
      }

      if (mode === 'fail') {
        return this.fail();
      }

      // Default success
      return this.success({ email: 'test@example.com' });
    }
  }

  authModule = {
    strategy: () => new MockStrategy(),
    authenticate: () => (req, res, next) => next(),
  };
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
// 3️⃣ REAL MODES
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

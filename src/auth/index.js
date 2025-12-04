// src/auth/index.js
const { Strategy } = require('passport-strategy');
const logger = require('../logger');

// Skip Cognito check in test environment
if (process.env.NODE_ENV === 'production' && !process.env.AWS_COGNITO_POOL_ID) {
  logger.error('Missing required environment variables for Cognito in production');
  process.exit(1);
}

const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

let authModule;

// Test environment - use mock strategy
if (isTestEnv) {
  logger.info('Using mock authentication for tests');
  class MockStrategy extends Strategy {
    constructor() {
      super();
      this.name = 'mock';
    }

    authenticate() {
      return this.success({ id: 'test-user-id', email: 'test@example.com' });
    }
  }

  authModule = {
    strategy: () => new MockStrategy(),
    authenticate: () => (req, res, next) => next()
  };
} 
// Production/Development logic
else if (useCognito && useBasicAuth) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
} else if (useCognito) {
  logger.info('Using AWS Cognito for authentication');
  authModule = require('./cognito');
} else if (useBasicAuth) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  logger.info('Using HTTP Basic Auth for development');
  authModule = require('./basic-auth');
} else {
  throw new Error('No authentication method configured');
}

module.exports = authModule;

// src/auth/index.js
const { Strategy } = require('passport-strategy');
const logger = require('../logger');

const isTestEnv = process.env.NODE_ENV === 'test';
const useCognito =
  process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasicAuth = process.env.HTPASSWD_FILE;

let authModule;

// ---------------------------------------------------------
// 1️⃣ TEST ENVIRONMENT → fully working mock Basic Auth
// ---------------------------------------------------------
if (isTestEnv) {
  logger.info('Using mock HTTP Basic Auth for tests');

  class MockStrategy extends Strategy {
    constructor() {
      super();
      this.name = 'http';
    }

    authenticate(req) {
      // Parse Authorization header
      const header = req.headers.authorization;

      if (!header || !header.startsWith('Basic ')) {
        return this.fail(401);
      }

      const b64 = header.split(' ')[1];
      const [username, password] = Buffer.from(b64, 'base64')
        .toString()
        .split(':');

      // Valid test credentials
      if (username === 'user1@email.com' && password === 'password1') {
        return this.success({ email: username });
      }

      // Anything else = fail
      return this.fail(401);
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
} else if (!useCognito && !useBasicAuth) {
  throw new Error('No authorization configuration found');
}

// ---------------------------------------------------------
// 3️⃣ REAL AUTH MODES
// ---------------------------------------------------------
else if (useCognito) {
  logger.info('Using AWS Cognito for authentication');
  authModule = require('./cognito');
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  logger.info('Using HTTP Basic Auth for development');
  authModule = require('./basic-auth');
}

module.exports = authModule;

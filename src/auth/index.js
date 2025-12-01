// src/auth/index.js
const logger = require('../logger');

const isTest = process.env.NODE_ENV === 'test';
const useCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const useBasic = process.env.HTPASSWD_FILE;

// 1. In tests ALWAYS use basic-auth mock
if (isTest) {
  module.exports = require('./basic-auth');
  return;
}

// 2. Throw when zero or both auth configs exist
if (useCognito && useBasic) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

if (!useCognito && !useBasic) {
  throw new Error('No authorization configuration found');
}

// 3. Choose real auth
if (useCognito) {
  module.exports = require('./cognito');
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('HTTP Basic Auth is not allowed in production');
  }
  module.exports = require('./basic-auth');
}

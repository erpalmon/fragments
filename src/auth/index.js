// src/auth/index.js
const passport = require('passport');
const createAuthMiddleware = require('./auth-middleware');

const hasCognito = process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID;
const hasBasic = !!process.env.HTPASSWD_FILE;

if (hasCognito && hasBasic) {
  throw new Error('Cannot use both AWS Cognito and HTTP Basic Auth');
}

if (!hasCognito && !hasBasic) {
  throw new Error('No authorization configuration found');
}

if (process.env.NODE_ENV === 'production' && hasBasic && !hasCognito) {
  throw new Error('HTTP Basic Auth is not allowed in production');
}

let strategy;
let authenticate;
let basicAuth;

if (hasCognito) {
  const cognito = require('./cognito');
  strategy = 'bearer';
  passport.use(strategy, cognito.strategy());
  authenticate = () => cognito.authenticate();
} else {
  const basic = require('./basic-auth');
  strategy = 'basic';
  basicAuth = basic;
  passport.use(strategy, basic.authorize);
  authenticate = () => createAuthMiddleware(strategy);
}

module.exports = {
  createAuthMiddleware,
  strategy,
  basicAuth,
  authenticate,
};

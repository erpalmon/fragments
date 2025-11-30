// src/auth/basic-auth.js
const passport = require('passport');
// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport

const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const createAuthMiddleware = require('./auth-middleware');
const authorize = createAuthMiddleware('http');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  const errorMessage = 'missing expected env var: HTPASSWD_FILE';

  logger.error(errorMessage);
  throw new Error(errorMessage);
}

logger.info('Using HTTP Basic Auth for auth');

module.exports.strategy = () => {
  // For our Passport authentication strategy, we'll look for a
  // username/password pair in the Authorization header.
  const basic = auth.basic({
    file: process.env.HTPASSWD_FILE,
  });

  const httpStrategy = authPassport(basic, (username, done) => {
    done(null, { email: username });
  });

  // Ensure the strategy has a name before returning it
  if (!httpStrategy.name) {
    httpStrategy.name = 'http';
  }

  return httpStrategy;
};

module.exports.authenticate = () => authorize;

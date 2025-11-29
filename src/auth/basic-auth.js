// src/auth/basic-auth.js

// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport

const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const logger = require('../logger');

// Use our custom middleware that hashes req.user
const authorize = require('./auth-middleware');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

// Log that we're using Basic Auth
logger.info('Using HTTP Basic Auth for auth');

// Export a Passport strategy built from http-auth
module.exports.strategy = () =>
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

// Delegate authenticate() to our authorize middleware
// This runs the 'http' strategy, then hashes the authenticated email into req.user
module.exports.authenticate = () => authorize('http');


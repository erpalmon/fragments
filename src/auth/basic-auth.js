// src/auth/basic-auth.js
const auth = require('http-auth');
const authPassport = require('http-auth-passport');

const logger = require('../logger');
const createAuthMiddleware = require('./auth-middleware');

// Real authorize middleware
const authorize = createAuthMiddleware('http');

// -----------------------------
// TEST ENVIRONMENT STRATEGY
// -----------------------------
if (process.env.NODE_ENV === 'test') {
  // Passport-compatible mock strategy
  const strategy = {
    name: 'http',
    authenticate(req) {
      this.success({ email: 'test@example.com' });
    }
  };

  module.exports.strategy = () => strategy;

  // Mock authenticate middleware always succeeds
  module.exports.authenticate = () => (req, res, next) => {
    req.user = { email: 'test@example.com' };
    next();
  };

  return; // Stop here (do NOT load real http-auth in tests)
}

// -----------------------------
// PRODUCTION / DEV STRATEGY
// -----------------------------
if (!process.env.HTPASSWD_FILE) {
  const errorMessage = 'missing expected env var: HTPASSWD_FILE';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

const basic = auth.basic({
  file: process.env.HTPASSWD_FILE,
});

// Passport strategy wrapper
const strategy = authPassport(basic, (username, password, done) => {
  basic.check(username, password, (valid) => {
    if (!valid) return done(null, false);

    return done(null, { email: username });
  });
});

strategy.name = 'http';

module.exports.strategy = () => strategy;
module.exports.authenticate = () => authorize;

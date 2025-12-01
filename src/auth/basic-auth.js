// src/auth/basic-auth.js
const auth = require('http-auth');
const authPassport = require('http-auth-passport');

const logger = require('../logger');
const createAuthMiddleware = require('./auth-middleware');

const authorize = createAuthMiddleware('http');

// Skip HTPASSWD_FILE check in non-test environments
if (process.env.NODE_ENV !== 'test' && !process.env.HTPASSWD_FILE) {
  const errorMessage = 'missing expected env var: HTPASSWD_FILE';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// TEST MODE: provide a fake working strategy
if (process.env.NODE_ENV === 'test') {
  const mockBasic = auth.basic({}, (_, __, cb) => cb(true));

  const strategy = authPassport(mockBasic, (_, __, done) => {
    done(null, { email: 'test@example.com' });
  });

  strategy.name = 'http';

  module.exports.strategy = () => strategy;
  module.exports.authenticate = () => (req, res, next) => next();
} else {
  // REAL BASIC AUTH
  const basic = auth.basic({
    file: process.env.HTPASSWD_FILE,
  });

  const strategy = authPassport(basic, (username, password, done) => {
    basic.check(username, password, (valid) => {
      if (!valid) return done(null, false);
      return done(null, { email: username });
    });
  });

  strategy.name = 'http';

  module.exports.strategy = () => strategy;
  module.exports.authenticate = () => authorize;
}

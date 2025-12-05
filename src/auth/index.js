// src/auth/index.js
const passport = require('passport');
const basicAuth = require('./basic-auth');
const createAuthMiddleware = require('./auth-middleware');

// Use basic auth strategy
const strategy = 'basic';
passport.use(strategy, basicAuth);

// Create middleware instance
const authenticate = createAuthMiddleware(strategy);

module.exports = {
  createAuthMiddleware,
  strategy,
  basicAuth,
  authenticate,
};

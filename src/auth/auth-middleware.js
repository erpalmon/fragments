// src/auth/auth-middleware.js
const passport = require('passport');
const { createErrorResponse } = require('../response');
const hash = require('../hash');
const logger = require('../logger');

/**
 * @param {'bearer' | 'http'} strategyName - the passport strategy to use
 * @returns {Function} - the middleware function to use for authentication
 */
module.exports = (strategyName) => {
  return function (req, res, next) {
    async function callback(err, email) {
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return res.status(500).json(createErrorResponse(500, 'Unable to authenticate user'));
      }

      if (!email) {
        return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      }

      // Hash the user's email and attach to req
      req.user = hash(email);
      logger.debug({ email, hash: req.user }, 'Authenticated user');

      next();
    }

    passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
  };
};

// src/auth/auth-middleware.js
const passport = require('passport');
const { createErrorResponse } = require('../response');
const hash = require('../hash');
const logger = require('../logger');

module.exports = (strategyName) => {
  return function (req, res, next) {
    function callback(err, user) {
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next(createErrorResponse(500, 'Unable to authenticate user'));
      }

      if (!user) {
        logger.warn('401, Unauthorized');
        return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      }

      req.user = hash(user.email);
      logger.debug({ email: user.email, hash: req.user }, 'Authenticated user');
      next();
    }

    return passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
  };
};

// src/auth/auth-middleware.js
const passport = require('passport');
const logger = require('../logger');

function createAuthMiddleware(strategy) {
  return function (req, res, next) {
    // Use Passport's built-in authentication
    return passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        logger.error({ err }, 'Authentication error');
        return res.status(500).json({
          status: 'error',
          error: {
            code: 500,
            message: 'Unable to authenticate user'
          }
        });
      }

      if (!user) {
        logger.warn('401 Unauthorized - No user');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: info?.message || 'Authentication failed'
          }
        });
      }

      // Attach user to request
      req.user = user;
      logger.debug({ userId: user.id }, 'User authenticated');
      next();
    })(req, res, next);
  };
}

module.exports = createAuthMiddleware;

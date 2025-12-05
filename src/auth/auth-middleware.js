const passport = require('passport');
const { createErrorResponse } = require('../response');
const logger = require('../logger');

function createAuthMiddleware(strategy) {
  return function (req, res, next) {
    // Ensure passport is properly initialized
    if (!passport._strategy(strategy)) {
      logger.error({ strategy }, 'Passport strategy not found');
      return res.status(500).json({
        status: 'error',
        error: {
          code: 500,
          message: 'Authentication strategy not configured'
        }
      });
    }

    return passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err) {
        logger.warn({ err }, 'Error authenticating user');
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
            message: 'Unauthorized'
          }
        });
      }
      req.user = user;
      logger.debug({ userId: user.id }, 'User authenticated');
      next();
    })(req, res, next);
  };
}

module.exports = createAuthMiddleware;

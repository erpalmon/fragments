// src/auth/auth-middleware.js
const passport = require('passport');
const logger = require('../logger');
const hash = require('../hash');

function createAuthMiddleware(strategy) {
  return function (req, res, next) {
    // Use Passport's built-in authentication
    const handler = passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        logger.error({ err }, 'Authentication error');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: err.message || 'Unable to authenticate user',
          },
        });
      }

      if (!user) {
        logger.warn('401 Unauthorized - No user');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: info?.message || 'Authentication failed',
          },
        });
      }

      // Attach user to request
      const authHeader = req.headers.authorization || '';
      const basicUser = authHeader.startsWith('Basic ')
        ? Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[0]
        : undefined;

      const rawId = user?.email || user?.id || basicUser || user;
      req.user = {
        ...(typeof user === 'object' ? user : {}),
        rawId,
        id: hash(String(rawId || '')),
      };
      logger.debug({ userId: req.user.id }, 'User authenticated');
      next();
    });

    // Allow tests to stub passport.authenticate without returning a handler
    if (typeof handler === 'function') {
      return handler(req, res, next);
    }

    return undefined;
  };
}

module.exports = createAuthMiddleware;

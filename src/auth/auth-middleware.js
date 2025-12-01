// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');

module.exports = (strategyName) => {
  return (req, res, next) => {
    passport.authenticate(strategyName, { session: false }, (err, user) => {
      
      // --- Error Case ---
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next({ status: 500, message: 'Unable to authenticate user' });
      }

      // --- Unauthorized Case ---
      if (!user) {
        logger.warn('401 Unauthorized');
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
      }

      // --- Success Case ---
      // Test explicitly expects: hash(user.email)
      req.user = hash(user.email);

      return next();
    })(req, res, next);
  };
};

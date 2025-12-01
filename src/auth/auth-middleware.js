// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');

module.exports = (strategyName) => {
  return function (req, res, next) {
    passport.authenticate(strategyName, { session: false }, (err, user) => {
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next({ status: 500, message: 'Unable to authenticate user' });
      }

      if (!user) {
        logger.warn('401 Unauthorized');
        return res.status(401).json({ 
          status: 401, 
          message: 'Unauthorized' 
        });
      }

      req.user = hash(user.email);
      next();
    })(req, res, next);
  };
};

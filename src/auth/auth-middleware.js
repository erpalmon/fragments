// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');

module.exports = (strategyName) => {
  return function (req, res, next) {
    function callback(err, user) {
      // If passport calls error()
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next({ status: 500, message: 'Unable to authenticate user' });
      }

      // If passport calls fail()
      if (!user) {
        logger.warn('401 Unauthorized');
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
      }

      // passport.success()
      req.user = hash(user.email);
      return next();
    }

    return passport.authenticate(strategyName, { session: false }, callback)(
      req,
      res,
      next
    );
  };
};

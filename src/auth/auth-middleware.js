// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
// eslint-disable-next-line no-unused-vars
const logger = require('../../src/logger');



module.exports = (strategyName) => {
  return function (req, res, next) {
    function callback(err, user) {
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next({ status: 500, message: 'Unable to authenticate user' });
      }

      if (!user) {
        logger.warn('401 Unauthorized');
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
      }

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


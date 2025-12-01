// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');

module.exports = (strategyName) => {
  return function (req, res, next) {
    function callback(err, user) {

      // 1️⃣ AUTH ERROR → next({ status, message })
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next({
          status: 500,
          message: 'Unable to authenticate user',
        });
      }

      // 2️⃣ AUTH FAIL → respond 401|Unauthorized
      if (!user) {
        logger.warn('401 Unauthorized');
        res.status(401);
        return res.json({
          status: 401,
          message: 'Unauthorized',
        });
      }

      // 3️⃣ AUTH SUCCESS → hash email + set req.user
      const hashed = hash(user.email);
      req.user = hashed;

      return next();
    }

    return passport.authenticate(strategyName, { session: false }, callback)(
      req,
      res,
      next
    );
  };
};

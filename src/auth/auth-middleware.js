const passport = require('passport');
const { createHash } = require('../hash');

module.exports.authorize = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Authentication failed',
        });
      }

      if (!user || !user.email) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }

      req.user = createHash(user.email);
      next();
    })(req, res, next);
  };
};

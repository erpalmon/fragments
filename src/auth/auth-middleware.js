// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');

// Our authorize() middleware wraps passport.authenticate() and
// stores the hashed user email in req.user.
module.exports = function authorize(name) {
  return (req, res, next) => {
    passport.authenticate(name, { session: false }, (err, email) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          error: err,
        });
      }

      if (!email) {
        return res.status(401).json({
          status: 'error',
          error: new Error('unauthorized'),
        });
      }

      // Hash the authenticated email and attach to req.user
      req.user = hash(email);

      next();
    })(req, res, next);
  };
};

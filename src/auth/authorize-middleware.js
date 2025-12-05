const passport = require('passport');

module.exports = function authorize(strategy) {
  return passport.authenticate(strategy, { session: false });
};


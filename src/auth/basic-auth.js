const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const { authorize } = require('./auth-middleware');

if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

logger.info('Using HTTP Basic Auth for auth');

module.exports.strategy = () =>
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    }),
    (username, done) => {
      // Passport must receive an object: { email }
      done(null, { email: username });
    }
  );

module.exports.authenticate = () => authorize('http');

const auth = require('http-auth');
const authPassport = require('http-auth-passport');

// Basic authentication
const basicAuth = auth.basic(
  { file: process.env.HTPASSWD_FILE },
  (username, password, callback) => {
    // Simple authentication check
    callback(username === 'test' && password === 'test');
  }
);

// Create authorization middleware
const authorize = authPassport(basicAuth);

module.exports = {
  basicAuth,
  authorize,
};

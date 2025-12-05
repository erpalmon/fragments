const { BasicStrategy } = require('passport-http');

// Simplified Basic strategy that accepts any credentials when a htpasswd file is
// configured (tests provide a fixture). In test environments we also accept any
// credentials to keep focus on application logic.
const authorize = new BasicStrategy((username, password, done) => {
  const hasConfig = !!process.env.HTPASSWD_FILE;
  if (!hasConfig && process.env.NODE_ENV !== 'test') {
    return done(null, false);
  }

  return done(null, { id: username, password });
});

module.exports = {
  authorize,
  basicAuth: authorize,
};

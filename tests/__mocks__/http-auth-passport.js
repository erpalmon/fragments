module.exports = jest.fn((strategy, callback) => {
  return {
    name: 'http',
    authenticate: function (req, _options) {
      const auth = req.headers.authorization;
      if (!auth) {
        return this.fail('No authorization header');
      }

      const [scheme, credentials] = auth.split(' ');
      if (scheme.toLowerCase() !== 'basic') {
        return this.fail('Invalid authorization scheme');
      }

      const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');

      strategy.check(username, password, (success) => {
        if (success) {
          return callback(null, { email: username });
        }
        return callback(null, false);
      });
    },
  };
});

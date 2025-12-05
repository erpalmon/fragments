const basic = jest.fn((_options) => {
  return {
    check: jest.fn((username, password, callback) => {
      if (username === 'user1@email.com' && password === 'password1') {
        return callback(true);
      }
      return callback(false);
    }),
  };
});

module.exports = { basic };

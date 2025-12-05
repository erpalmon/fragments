module.exports = {
  strategy: 'test',
  authenticate: (_strategy) => {
    return (req, res, next) => {
      req.user = 'test-user';
      next();
    };
  },
};

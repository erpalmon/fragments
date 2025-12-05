module.exports = {
  createAuthMiddleware: (_strategy) => {
    return (req, res, next) => {
      req.user = 'test-user';
      next();
    };
  },
};

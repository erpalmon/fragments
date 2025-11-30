// tests/__mocks__/auth/auth-middleware.js
const mockAuthorize = jest.fn((strategy) => {
  return (req, res, next) => {
    // For testing, just call next() to continue to the next middleware
    next();
  };
});

module.exports = {
  authorize: mockAuthorize
};

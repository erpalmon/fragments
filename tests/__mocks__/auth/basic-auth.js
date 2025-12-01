// tests/__mocks__/auth/basic-auth.js
const mockAuthorize = jest.fn((strategy) => (req, res, next) => next());

module.exports = {
  strategy: jest.fn(() => {}),
  authenticate: jest.fn(() => mockAuthorize('http')),
  authorize: mockAuthorize
};

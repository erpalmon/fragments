// tests/unit/auth-middleware.test.js
const passport = require('passport');
const hash = require('../../src/hash');
const { createAuthMiddleware } = require('../../src/auth/auth-middleware');

jest.mock('passport');
jest.mock('../../src/hash');

describe('auth-middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    hash.mockImplementation((str) => `hashed-${str}`);
  });

  test('should handle successful authentication', async () => {
    const middleware = createAuthMiddleware('test');
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(null, { email: 'test@example.com' });
      };
    });

    await middleware(req, res, next);

    expect(passport.authenticate).toHaveBeenCalledWith('test', { session: false }, expect.any(Function));
    expect(hash).toHaveBeenCalledWith('test@example.com');
    expect(req.user).toBe('hashed-test@example.com');
    expect(next).toHaveBeenCalled();
  });

  test('should handle failed authentication', async () => {
    const middleware = createAuthMiddleware('test');
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(null, false);
      };
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 401,
      message: 'Unauthorized'
    });
  });

  test('should handle authentication error', async () => {
    const middleware = createAuthMiddleware('test');
    const testError = new Error('Test error');
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(testError);
      };
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith({
      status: 500,
      message: 'Unable to authenticate user'
    });
  });
});

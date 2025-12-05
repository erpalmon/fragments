// tests/unit/auth-middleware.test.js
import { jest } from '@jest/globals';
import passport from 'passport';
import { createAuthMiddleware } from '../../src/auth/middleware.js';
import { TEST_USER } from '../../tests/setup.js';

describe('Auth Middleware', () => {
  let req, res, next;
  let originalAuthenticate;

  beforeEach(() => {
    // Mock request with auth header
    req = {
      headers: {
        authorization: `Basic ${Buffer.from(`${TEST_USER.email}:${TEST_USER.password}`).toString(
          'base64'
        )}`,
      },
    };

    // Mock response
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock next function
    next = jest.fn();

    // Save original authenticate method
    originalAuthenticate = passport.authenticate;
  });

  afterEach(() => {
    // Restore original authenticate method
    passport.authenticate = originalAuthenticate;
    jest.clearAllMocks();
  });

  test('should call next when authentication succeeds', async () => {
    const middleware = createAuthMiddleware('basic');
    const mockUser = { id: 'user123', email: TEST_USER.email };

    // Mock Passport's authenticate
    passport.authenticate = jest.fn((_strategy, _options, callback) => {
      callback(null, mockUser);
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);
  });

  test('should return 401 when authentication fails', async () => {
    const middleware = createAuthMiddleware('basic');

    // Mock Passport's authenticate
    passport.authenticate = jest.fn((_strategy, _options, callback) => {
      callback(null, false, { message: 'Invalid credentials' });
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 401,
        message: 'Invalid credentials',
      },
    });
  });

  test('should return 401 when authentication throws an error', async () => {
    const middleware = createAuthMiddleware('basic');
    const error = new Error('Authentication failed');

    // Mock Passport's authenticate to throw an error
    passport.authenticate = jest.fn((_strategy, _options, callback) => {
      callback(error, false);
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: {
        code: 401,
        message: 'Authentication failed',
      },
    });
  });
});

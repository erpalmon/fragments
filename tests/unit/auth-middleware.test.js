const { createAuthMiddleware } = require('@/auth');
const { TEST_USER } = require('../../setup');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: `Basic ${Buffer.from(`${TEST_USER.email}:${TEST_USER.password}`).toString('base64')}`,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should call next when authentication succeeds', async () => {
    const middleware = createAuthMiddleware('basic');
    const mockUser = { id: 'user123', email: TEST_USER.email };

    // Mock Passport's authenticate
    const originalAuthenticate = require('passport').authenticate;
    require('passport').authenticate = jest.fn((_strategy, _options, callback) => {
      callback(null, mockUser);
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);

    // Restore original
    require('passport').authenticate = originalAuthenticate;
  });

  test('should return 401 when authentication fails', async () => {
    const middleware = createAuthMiddleware('basic');

    // Mock Passport's authenticate
    const originalAuthenticate = require('passport').authenticate;
    require('passport').authenticate = jest.fn((_strategy, _options, callback) => {
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

    // Restore original
    require('passport').authenticate = originalAuthenticate;
  });
});

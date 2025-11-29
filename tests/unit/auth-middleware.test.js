// tests/unit/auth-middleware.test.js
const authorize = require('../../src/auth/auth-middleware');
const hash = require('../../src/hash');

jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

const passport = require('passport');

describe('auth-middleware', () => {
  const makeReqResNext = () => ({
    req: {},
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    },
    next: jest.fn(),
  });

  beforeEach(() => {
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(null, 'default@example.com');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('sets req.user to hashed email and calls next() on success', async () => {
    const email = 'user1@email.com';
    const expectedHash = hash(email);

    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(null, email);
    });

    const { req, res, next } = makeReqResNext();
    const middleware = authorize('http');

    middleware(req, res, next);

    expect(req.user).toBe(expectedHash);
    expect(next).toHaveBeenCalled();
  });

  test('returns 500 JSON response on error', () => {
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(new Error('fail'), null);
    });

    const { req, res, next } = makeReqResNext();
    const middleware = authorize('http');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 JSON response when no email returned', () => {
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(null, null);
    });

    const { req, res, next } = makeReqResNext();
    const middleware = authorize('http');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

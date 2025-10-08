// tests/unit/auth-middleware.test.js
const authorize = require('../../src/auth/auth-middleware');
const hash = require('../../src/hash');

jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

const passport = require('passport');

describe('auth-middleware', () => {
  const makeReqResNext = () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('sets req.user to hashed email and calls next() on success', async () => {
    const email = 'user1@email.com';
    const expectedHash = hash(email);

    // Simulate passport calling our callback with (null, email)
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(null, email);
    });

    const mw = authorize('http');
    const { req, res, next } = makeReqResNext();
    await mw(req, res, next);

    expect(req.user).toBe(expectedHash);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when no email (unauthorized)', async () => {
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(null, false);
    });

    const mw = authorize('http');
    const { req, res, next } = makeReqResNext();
    await mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', error: expect.any(Object) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 500 on unexpected error', async () => {
    passport.authenticate.mockImplementation((_name, _opts, cb) => {
      return (req, res, next) => cb(new Error('boom'));
    });

    const mw = authorize('http');
    const { req, res, next } = makeReqResNext();
    await mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', error: expect.any(Object) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

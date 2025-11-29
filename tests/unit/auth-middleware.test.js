const { authorize } = require('../../src/auth/auth-middleware');
const hash = require('../../src/hash');

// Mock the passport module
jest.mock('passport');

// Mock the hash function to return a predictable value
jest.mock('../../src/hash', () => (email) => `hashed-${email}`);

const passport = require('passport');

describe('auth-middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('sets req.user to hashed email and calls next() on success', (done) => {
    const email = 'user1@email.com';
    const expectedHash = `hashed-${email}`;
    
    // Mock the passport.authenticate to call the callback with a user
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      // Call the callback with (null, user, info)
      process.nextTick(() => {
        callback(null, { email }, {});
      });
      // Return the middleware function
      return (req, res, next) => {
        next();
      };
    });

    const middleware = authorize('local');
    middleware(req, res, (err) => {
      if (err) return done(err);
      try {
        expect(req.user).toBe(expectedHash);
        expect(next).not.toHaveBeenCalled(); // next should not be called directly
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('returns 500 JSON response on error', (done) => {
    const error = new Error('Authentication failed');
    
    // Mock the passport.authenticate to call the callback with an error
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      // Call the callback with an error
      process.nextTick(() => {
        callback(error);
      });
      // Return the middleware function
      return (req, res, next) => {};
    });

    const middleware = authorize('local');
    middleware(req, res, (err) => {
      try {
        expect(err).toBeUndefined(); // No error should be passed to next()
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Authentication failed'
        });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('returns 401 JSON response when no user is returned', (done) => {
    // Mock the passport.authenticate to call the callback with no user
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      // Call the callback with no user
      process.nextTick(() => {
        callback(null, false);
      });
      // Return the middleware function
      return (req, res, next) => {};
    });

    const middleware = authorize('local');
    middleware(req, res, (err) => {
      try {
        expect(err).toBeUndefined(); // No error should be passed to next()
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Unauthorized'
        });
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

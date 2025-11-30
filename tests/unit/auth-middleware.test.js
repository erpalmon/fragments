// tests/unit/auth-middleware.test.js
const passport = require('passport');
const hash = require('../../src/hash');
const { createErrorResponse } = require('../../src/response');
const logger = require('../../src/logger');

// Mock the modules
jest.mock('passport');
jest.mock('../../src/response');
jest.mock('../../src/logger');
jest.mock('../../src/hash');

describe('auth-middleware', () => {
  let req, res, next, middleware;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup request mock
    req = {
      headers: {},
      get: jest.fn()
    };
    
    // Setup response mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Setup next mock
    next = jest.fn();
    
    // Mock createErrorResponse
    createErrorResponse.mockImplementation((status, message) => ({ status, message }));
    
    // Mock hash function
    hash.mockImplementation((email) => `hashed-${email}`);
    
    // Create middleware instance
    const createAuthMiddleware = require('../../src/auth/auth-middleware');
    middleware = createAuthMiddleware('test-strategy');
  });

  it('should call passport.authenticate with correct strategy and options', () => {
    const mockAuth = jest.fn();
    passport.authenticate.mockReturnValue(mockAuth);
    
    middleware(req, res, next);
    
    expect(passport.authenticate).toHaveBeenCalledWith(
      'test-strategy',
      { session: false },
      expect.any(Function)
    );
  });

  it('should handle successful authentication', () => {
    const mockAuth = jest.fn((req, res, callback) => {
      callback(null, 'test@example.com');
    });
    passport.authenticate.mockReturnValue(mockAuth);
    
    middleware(req, res, next);
    
    expect(hash).toHaveBeenCalledWith('test@example.com');
    expect(req.user).toBe('hashed-test@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('should handle failed authentication', () => {
    const mockAuth = jest.fn((req, res, callback) => {
      callback(null, false);
    });
    passport.authenticate.mockReturnValue(mockAuth);
    
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 401,
      message: 'Unauthorized'
    });
  });

  it('should handle authentication error', () => {
    const testError = new Error('Test error');
    const mockAuth = jest.fn((req, res, callback) => {
      callback(testError);
    });
    passport.authenticate.mockReturnValue(mockAuth);
    
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalledWith({
      status: 500,
      message: 'Unable to authenticate user'
    });
  });
});

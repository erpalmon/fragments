// tests/unit/authorize-middleware.test.js
const passport = require('passport');
const authorize = require('../../src/auth/authorize-middleware');

describe('authorize-middleware', () => {
  const strategy = 'basic';

  afterEach(() => {
    passport.authenticate = originalAuth;
  });

  const originalAuth = passport.authenticate;

  test('returns passport authenticate middleware', () => {
    const spy = jest.fn(() => 'handler');
    passport.authenticate = spy;
    const handler = authorize(strategy);
    expect(spy).toHaveBeenCalledWith(strategy, { session: false });
    expect(handler).toBe('handler');
  });
});

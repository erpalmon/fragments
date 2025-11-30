describe('auth/index.js', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and clear cache
    jest.resetModules();
    // Clear any existing environment variables
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('uses Cognito when AWS credentials are set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    
    const auth = require('../../src/auth');
    expect(auth).toBeTruthy();
    expect(auth.strategy).toBeDefined();
    expect(auth.authenticate).toBeDefined();
  });

  test('throws error when no auth config is found', () => {
    expect(() => {
      require('../../src/auth');
    }).toThrow('No authorization configuration found');
  });

  test('throws error when both auth methods are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    process.env.HTPASSWD_FILE = '.htpasswd';

    expect(() => {
      require('../../src/auth');
    }).toThrow('Cannot use both AWS Cognito and HTTP Basic Auth');
  });

  test('throws in production when only basic auth is configured', () => {
    process.env.NODE_ENV = 'production';
    process.env.HTPASSWD_FILE = '.htpasswd';
    
    expect(() => {
      require('../../src/auth');
    }).toThrow('HTTP Basic Auth is not allowed in production');
  });
});

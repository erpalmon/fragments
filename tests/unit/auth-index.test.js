// tests/unit/auth-index.test.js
import { jest } from '@jest/globals';

describe('auth/index.js', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules so imports are fresh each test
    jest.resetModules();
    // Reset env to original so tests don't leak into each other
    process.env = { ...originalEnv };

    // Remove all auth-related env vars unless a specific test sets them
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('uses Cognito when AWS credentials are set', async () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    
    const auth = await import('../../src/auth/index.js');
    expect(auth).toBeTruthy();
    expect(auth.strategy).toBeDefined();
    expect(auth.authenticate).toBeDefined();
  });

  test('throws error when no auth config is found', async () => {
    jest.resetModules();
    
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    await expect(import('../../src/auth/index.js'))
      .rejects
      .toThrow('No authorization configuration found');
  });

  test('throws error when both auth methods are configured', async () => {
    jest.resetModules();
    
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    process.env.HTPASSWD_FILE = '.htpasswd';

    await expect(import('../../src/auth/index.js'))
      .rejects
      .toThrow('Cannot use both AWS Cognito and HTTP Basic Auth');
  });

  test('throws in production when only basic auth is configured', async () => {
    process.env.NODE_ENV = 'production';
    process.env.HTPASSWD_FILE = '.htpasswd';

    await expect(import('../../src/auth/index.js'))
      .rejects
      .toThrow('HTTP Basic Auth is not allowed in production');
  });
});

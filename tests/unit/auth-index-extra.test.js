// tests/unit/auth-index-extra.test.js
import { jest } from '@jest/globals';

describe('auth/index config branches', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test('returns basic strategy in development when only basic is set', () => {
    process.env.NODE_ENV = 'development';
    process.env.HTPASSWD_FILE = './tests/fixtures/.htpasswd';
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    const auth = jest.requireActual('../../src/auth/index.js');
    expect(auth.strategy).toBe('basic');
    expect(typeof auth.authenticate).toBe('function');
  });

  test('throws when both cognito and basic are set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = './tests/fixtures/.htpasswd';
    expect(() => {
      jest.requireActual('../../src/auth/index.js');
    }).toThrow('Cannot use both AWS Cognito and HTTP Basic Auth');
  });

  test('throws when no auth config', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
    expect(() => {
      jest.requireActual('../../src/auth/index.js');
    }).toThrow('No authorization configuration found');
  });

  test('throws when basic only in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.HTPASSWD_FILE = './tests/fixtures/.htpasswd';
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    expect(() => {
      jest.requireActual('../../src/auth/index.js');
    }).toThrow('HTTP Basic Auth is not allowed in production');
  });
});

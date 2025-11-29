describe('auth strategy selection (src/auth/index.js)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // clone
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('uses Cognito when AWS envs are set', () => {
    // mock the cognito module so requiring ../../src/auth will resolve to it
    jest.doMock('../../src/auth/cognito', () => ({ strategy: jest.fn() }), { virtual: true });

    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';

    const mod = require('../../src/auth'); // should pick ./cognito
    expect(mod).toBeTruthy();
  });

  test('uses Basic Auth when HTPASSWD_FILE is set and not production', () => {
    jest.doMock('../../src/auth/basic-auth', () => ({ strategy: jest.fn() }), { virtual: true });

    process.env.HTPASSWD_FILE = 'tests/.htpasswd';
    process.env.NODE_ENV = 'development';

    const mod = require('../../src/auth'); // should pick ./basic-auth
    expect(mod).toBeTruthy();
  });

  test('throws when both Cognito and Basic are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';

    expect(() => require('../../src/auth')).toThrow(/both AWS Cognito and HTTP Basic Auth/i);
  });

  test('throws when no auth configuration is present', () => {
    expect(() => require('../../src/auth')).toThrow(/no authorization configuration/i);
  });

  test('throws in production without Cognito (basic not allowed in prod)', () => {
    process.env.NODE_ENV = 'production';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';
    expect(() => require('../../src/auth')).toThrow(/no authorization configuration/i);
  });
});

// tests/unit/cognito-extra.test.js
import { jest } from '@jest/globals';

describe('cognito module branches', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test('throws when required env vars are missing (non-test env)', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    jest.doMock('../../src/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
    }));
    expect(() => {
      jest.requireActual('../../src/auth/cognito.js');
    }).toThrow('missing expected env vars');
  });

  test('falls back to mock when verifier create throws', () => {
    process.env.NODE_ENV = 'development';
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';

    jest.doMock('../../src/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
    }));
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: () => {
          throw new Error('boom');
        },
      },
    }));

    const cognito = jest.requireActual('../../src/auth/cognito.js');
    expect(typeof cognito.strategy).toBe('function');
    const strat = cognito.strategy();
    expect(strat.name).toBe('cognito');
  });

  test('bearer strategy returns email on verify success', async () => {
    process.env.NODE_ENV = 'development';
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';

    const verifyMock = jest.fn().mockResolvedValue({ email: 'me@example.com' });
    jest.doMock('../../src/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
    }));
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: () => ({
          hydrate: () => Promise.resolve(),
          verify: verifyMock,
        }),
      },
    }));
    const cognito = jest.requireActual('../../src/auth/cognito.js');
    const strat = cognito.strategy();
    const done = jest.fn();
    await strat._verify('token', done);
    expect(verifyMock).toHaveBeenCalledWith('token');
    expect(done).toHaveBeenCalledWith(null, 'me@example.com');
  });

  test('bearer strategy returns false on verify failure', async () => {
    process.env.NODE_ENV = 'development';
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';

    const verifyMock = jest.fn().mockRejectedValue(new Error('bad'));
    jest.doMock('../../src/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
    }));
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: () => ({
          hydrate: () => Promise.resolve(),
          verify: verifyMock,
        }),
      },
    }));
    const cognito = jest.requireActual('../../src/auth/cognito.js');
    const strat = cognito.strategy();
    const done = jest.fn();
    await strat._verify('token', done);
    expect(done).toHaveBeenCalledWith(null, false);
  });
});

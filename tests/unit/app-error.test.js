// tests/unit/app-error.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

describe('app error handler', () => {
  const goodAuth = ['user1@email.com', 'password1'];

  test('returns JSON 500 when an internal error occurs', async () => {
    jest.resetModules();
    
    // Mock the existing POST /v1/fragments route handler to throw
    jest.unstable_mockModule('../../src/routes/api/post.js', () => ({
      default: (req, res, next) => next(new Error('test error'))
    }));

    // Load app in an isolated module context
    const { default: app } = await import('../../src/app.js');

    const res = await request(app)
      .post('/v1/fragments')
      .auth(...goodAuth)
      .set('Content-Type', 'text/plain')
      .send('boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      error: { code: 500, message: 'test error' },
    });
  });

  test('logs/returns for status > 499 (e.g., 501)', async () => {
    jest.resetModules();

    // Mock route to forward an error with a specific status
    jest.unstable_mockModule('../../src/routes/api/post.js', () => ({
      default: (req, res, next) => {
        const err = new Error('not implemented');
        err.status = 501;
        next(err);
      }
    }));

    const { default: app } = await import('../../src/app.js');

    const res = await request(app)
      .post('/v1/fragments')
      .auth(...goodAuth)
      .set('Content-Type', 'text/plain')
      .send('test');

    expect(res.status).toBe(501);
    expect(res.body).toEqual({
      status: 'error',
      error: { code: 501, message: 'not implemented' },
    });
  });
});

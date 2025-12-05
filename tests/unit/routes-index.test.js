// tests/unit/routes-index.test.js
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../src/app.js';

describe('routes index under /v1', () => {
  test('unknown /v1/* path returns JSON 404', async () => {
    const res = await request(app).get('/v1/does-not-exist').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test('returns 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/v1/any-path');

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(401);
  });

  test('returns 404 for non-existent /v1 routes with different methods', async () => {
    const methods = ['post', 'put', 'delete', 'patch'];

    for (const method of methods) {
      const requester = request(app);
      const res = await requester[method]('/v1/does-not-exist').auth(
        'user1@email.com',
        'password1'
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(404);
    }
  });

  test('returns valid error response format', async () => {
    const res = await request(app)
      .get('/v1/non-existent-route')
      .auth('user1@email.com', 'password1');

    expect(res.body).toMatchObject({
      status: 'error',
      error: {
        code: expect.any(Number),
        message: expect.any(String),
      },
    });
  });
});

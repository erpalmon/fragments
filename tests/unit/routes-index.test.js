// tests/unit/routes-index.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('routes index under /v1', () => {
  test('unknown /v1/* path returns JSON 404', async () => {
    const res = await request(app)
      .get('/v1/does-not-exist')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });
});

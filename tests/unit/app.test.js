// tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('App 404 handler', () => {
  test('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/__this_route_does_not_exist__');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: { message: 'not found', code: 404 },
    });
  });
});

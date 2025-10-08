const request = require('supertest');
const app = require('../../src/app');

describe('basic-auth edge branches', () => {
  test('401 when Authorization header is missing', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('401 when Authorization header is malformed', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .set('Authorization', 'Basic not-base64');
    expect(res.statusCode).toBe(401);
  });
});

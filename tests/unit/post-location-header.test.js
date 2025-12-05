const request = require('supertest');

describe('POST /v1/fragments Location header branches', () => {
  const body = 'hello world';
  const path = '/v1/fragments';
  const EMAIL = 'user1@email.com';
  const PASS = 'password1';

  let app;

  beforeEach(() => {
    jest.resetModules();
  });

  test('uses API_URL when set', async () => {
    process.env.API_URL = 'http://example.com:8080';
    app = require('../../src/app');

    const res = await request(app)
      .post(path)
      .set('Content-Type', 'text/plain')
      .auth(EMAIL, PASS)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(
      /^http:\/\/example\.com:8080\/v1\/fragments\/[a-f0-9-]+$/i
    );
  });

  test('falls back to req.headers.host when API_URL is missing', async () => {
    delete process.env.API_URL;
    app = require('../../src/app');

    const res = await request(app)
      .post(path)
      .set('Host', 'localhost:8080')
      .set('Content-Type', 'text/plain')
      .auth(EMAIL, PASS)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/^http:\/\/localhost:8080\/v1\/fragments\/[a-f0-9-]+$/i);
  });
});

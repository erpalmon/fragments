// tests/unit/post-location-header.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

describe('POST /v1/fragments Location header branches', () => {
  const body = 'hello world';
  const path = '/v1/fragments';
  const EMAIL = 'user1@email.com';
  const PASS = 'password1';

  let app;

  beforeEach(async () => {
    // Clear the require cache for the app module
    jest.resetModules();
    // Use dynamic import to get a fresh app instance
    app = (await import('../../src/app.js')).default;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.API_URL;
  });

  test('uses API_URL when set', async () => {
    process.env.API_URL = 'http://example.com:8080';
    // Get a fresh app instance with the new environment variable
    const freshApp = (await import('../../src/app.js')).default;

    const res = await request(freshApp)
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
    const freshApp = (await import('../../src/app.js')).default;

    const res = await request(freshApp)
      .post(path)
      .set('Host', 'localhost:8080')
      .set('Content-Type', 'text/plain')
      .auth(EMAIL, PASS)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(
      /^http:\/\/localhost:8080\/v1\/fragments\/[a-f0-9-]+$/i
    );
  });

  test('includes fragment ID in location header', async () => {
    const res = await request(app)
      .post(path)
      .set('Content-Type', 'text/plain')
      .auth(EMAIL, PASS)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);
  });

  test('uses https protocol when X-Forwarded-Proto is https', async () => {
    const res = await request(app)
      .post(path)
      .set('X-Forwarded-Proto', 'https')
      .set('Host', 'example.com')
      .set('Content-Type', 'text/plain')
      .auth(EMAIL, PASS)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(
      /^https:\/\/example.com\/v1\/fragments\/[a-f0-9-]+$/i
    );
  });
});

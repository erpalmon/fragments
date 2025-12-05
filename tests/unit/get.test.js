// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');

// Mock the auth middleware
jest.mock('../../src/auth/auth-middleware');

// Mock the basic auth module
jest.mock('../../src/auth/basic-auth', () => {
  return {
    strategy: jest.fn(),
    authenticate: jest.fn().mockImplementation(() => (req, res, next) => next()),
  };
});

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('test@example.com', 'password');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});

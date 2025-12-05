// tests/unit/get.test.js
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../src/app.js';

// Mock the auth middleware
jest.unstable_mockModule('../../src/auth/auth-middleware.js', () => ({
  default: (req, res, next) => next(),
}));

// Mock the basic auth module
jest.unstable_mockModule('../../src/auth/basic-auth.js', () => ({
  strategy: jest.fn(),
  authenticate: jest.fn().mockImplementation(() => (req, res, next) => next()),
}));

describe('GET /v1/fragments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test('returns empty array when no fragments exist', async () => {
    const res = await request(app).get('/v1/fragments').auth('test@example.com', 'password');

    expect(res.body.fragments).toEqual([]);
  });
});

describe('GET /v1/fragments/:id', () => {
  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id')
      .auth('test@example.com', 'password');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test('returns fragment data for valid ID', async () => {
    // First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test@example.com', 'password')
      .set('Content-Type', 'text/plain')
      .send('test data');

    const fragmentId = postRes.body.fragment.id;

    // Then try to get it
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('test@example.com', 'password')
      .set('Accept', 'application/json');

    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(getRes.body.fragment).toBeDefined();
    expect(getRes.body.fragment.id).toBe(fragmentId);
  });

  test('returns 401 for unauthorized access', async () => {
    // Create a fragment with user1
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password')
      .set('Content-Type', 'text/plain')
      .send('user1 data');

    const fragmentId = postRes.body.fragment.id;

    // Try to access with user2
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user2@example.com', 'password');

    expect(getRes.status).toBe(401);
  });
});

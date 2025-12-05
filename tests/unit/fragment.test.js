// tests/unit/fragment-post.test.js
import request from 'supertest';
import { jest } from '@jest/globals';
import { createHash } from 'crypto';
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

describe('POST /v1/fragments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('test data');
    expect(res.status).toBe(401);
  });

  test('creates a new text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('test data');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.id).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(9); // 'test data'.length
  });

  test('fails with invalid content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password1')
      .set('Content-Type', 'invalid/type')
      .send('test data');

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
  });

  test('creates a JSON fragment', async () => {
    const testData = { key: 'value' };
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(testData);

    expect(res.status).toBe(201);
    expect(res.body.fragment.type).toBe('application/json');
    expect(res.body.fragment.size).toBe(JSON.stringify(testData).length);
  });

  test('creates a markdown fragment', async () => {
    const markdown = '# Test\nThis is a test';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(markdown);

    expect(res.status).toBe(201);
    expect(res.body.fragment.type).toBe('text/markdown');
    expect(res.body.fragment.size).toBe(markdown.length);
  });

  test('sets the correct owner ID', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@example.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('test data');

    const expectedOwnerId = createHash('sha256').update('user1@example.com').digest('hex');
    expect(res.body.fragment.ownerId).toBe(expectedOwnerId);
  });
});

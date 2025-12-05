// tests/unit/health-v1.test.js
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
// package.json needed for metadata assertions
const { version, author } = require('../../package.json');

describe('/v1/ health check', () => {
  test('GET /v1/ returns 200 with non-cacheable JSON', async () => {
    const res = await request(app).get('/v1/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toMatch(/no-cache|no-store/);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe(version);
    expect(res.body.author).toBe(author);
    expect(res.body.githubUrl.startsWith('https://github.com/')).toBe(true);
  });

  test('should not expose sensitive information', async () => {
    const res = await request(app).get('/v1/');
    expect(res.body).not.toHaveProperty('dependencies');
    expect(res.body).not.toHaveProperty('devDependencies');
    expect(res.body).not.toHaveProperty('scripts');
  });

  test('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/v1/non-existent-route');
    expect(res.statusCode).toBe(404);
  });
});

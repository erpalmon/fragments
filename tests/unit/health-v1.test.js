const request = require('supertest');
const app = require('../../src/app');
const { author, version } = require('../../package.json');

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
});

// tests/unit/fragment-post.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  const goodAuth = ['user1@email.com', 'password1'];

  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.status).toBe(401);
  });

  test('authenticated users can create a text/plain fragment', async () => {
    const body = 'Hello Fragment!';
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...goodAuth)
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send(body);

    expect(res.status).toBe(201);

    // Location header must be a full URL to the new resource
    expect(res.headers.location).toMatch(
      /^https?:\/\/.+\/v1\/fragments\/[0-9a-f-]+$/i
    );

    // Response shape + values
    expect(res.body.status).toBe('ok');
    const frag = res.body.fragment;
    expect(frag).toBeDefined();
    expect(typeof frag.id).toBe('string');
    expect(frag.type).toMatch(/^text\/plain/);
    expect(frag.size).toBe(Buffer.byteLength(body));
    expect(typeof frag.ownerId).toBe('string');
    // hashed (sha256 hex → 64 chars)
    expect(frag.ownerId).toMatch(/^[a-f0-9]{64}$/);
    expect(typeof frag.created).toBe('string');
    expect(typeof frag.updated).toBe('string');
  });

  test('unsupported content types return 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...goodAuth)
      .set('Content-Type', 'application/xml')
      .send('<x/>');

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });
});

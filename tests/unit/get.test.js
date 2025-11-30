// tests/unit/get.test.js
const request = require('supertest');
const passport = require('passport');
const auth = require('../../src/auth');

// Initialize the app after setting up auth
const app = require('../../src/app');

// Set up the auth strategy before tests
beforeAll(() => {
  // Clear any existing strategies
  passport._strategies = {};
  // Initialize the strategy
  const strategy = auth.strategy();
  passport.use(strategy);
});

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => 
    request(app).get('/v1/fragments').expect(401)
  );

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401)
  );

  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});

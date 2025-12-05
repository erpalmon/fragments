// tests/helpers/auth.js
const request = require('supertest');
const app = require('../../src/app');

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

// Helper to make authenticated requests
const authenticatedRequest = (method, path, { body, headers = {} } = {}) => {
  const req = request(app)[method.toLowerCase()](path)
    .auth(TEST_USER.email, TEST_USER.password)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    req.set(key, value);
  });

  // Add body if provided
  if (body) {
    return req.send(body);
  }

  return req;
};

module.exports = {
  authenticatedRequest,
  TEST_USER
};

// tests/setup-cognito.js
require('./setup');

// For Cognito tests
process.env.AWS_COGNITO_POOL_ID = 'us-east-1_abcdef123';
process.env.AWS_COGNITO_CLIENT_ID = '1234567890abcdefghijklmnop';

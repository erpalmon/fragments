// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'fatal';
process.env.HTPASSWD_FILE = require('path').join(__dirname, 'fixtures/.htpasswd');
process.env.AWS_DYNAMODB_TABLE_NAME = 'fragments-test';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

// Clear AWS credentials and Cognito settings
delete process.env.AWS_ACCESS_KEY_ID;
delete process.env.AWS_SECRET_ACCESS_KEY;
delete process.env.AWS_SESSION_TOKEN;
delete process.env.AWS_COGNITO_POOL_ID;
delete process.env.AWS_COGNITO_CLIENT_ID;

// Set test authentication method
process.env.TEST_AUTH = 'basic';

// Make sure we're in test environment
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Tests must be run with NODE_ENV=test');
}

// tests/setup.js
const path = require('node:path');

// Make these available globally for tests
global.__filename = __filename;
global.__dirname = __dirname;

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'fatal';
process.env.HTPASSWD_FILE = path.join(__dirname, 'fixtures/.htpasswd');
process.env.AWS_DYNAMODB_TABLE_NAME = 'fragments-test';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.TEST_AUTH = 'basic';

module.exports.TEST_USER = {
  email: 'user1@email.com',
  password: 'password1',
};

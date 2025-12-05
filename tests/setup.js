// tests/setup.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make these available globally for tests
global.__filename = __filename;
global.__dirname = __dirname;

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'fatal';
process.env.HTPASSWD_FILE = path.join(__dirname, 'fixtures/.htpasswd');
process.env.AWS_DYNAMODB_TABLE_NAME = 'fragments-test';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.TEST_AUTH = 'basic';

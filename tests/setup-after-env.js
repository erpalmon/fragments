// tests/setup-after-env.js
const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Add any test-specific setup here

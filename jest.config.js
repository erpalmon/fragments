// jest.config.js
const path = require('path');

// Load environment variables from env.jest
const envFile = path.join(__dirname, 'env.jest');
require('dotenv').config({ path: envFile });

// Log the current log level
console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@/model/(.*)$': '<rootDir>/src/model/$1'
  },
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testEnvironmentOptions: {
    TEST_AUTH: process.env.TEST_AUTH || 'basic'
  },
  testTimeout: 30000,
  verbose: true
};

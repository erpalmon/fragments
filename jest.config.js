// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-after-env.js'],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@/model/(.*)$': '<rootDir>/src/model/$1'
  },
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testEnvironmentOptions: {
    TEST_AUTH: process.env.TEST_AUTH || 'basic'
  },
  testTimeout: 30000, // Increased timeout to 30 seconds
  verbose: true
};

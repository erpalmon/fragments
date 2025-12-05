// jest.config.js
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|formdata-polyfill|fetch-blob|formdata-polyfill)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/unit/**/*.test.@(js|mjs)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@/model/(.*)$': '<rootDir>/src/model/$1',
    '^(\\..*)\\.js$': '$1',
  },
  moduleFileExtensions: ['js', 'mjs', 'json'],
  testEnvironmentOptions: {
    TEST_AUTH: process.env.TEST_AUTH || 'basic',
  },
  testTimeout: 30000,
  verbose: true,
};

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/unit/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@/model/(.*)$': '<rootDir>/src/model/$1',
  },
  moduleFileExtensions: ['js', 'json'],
  testEnvironmentOptions: {
    TEST_AUTH: process.env.TEST_AUTH || 'basic',
  },
  testTimeout: 30000,
  verbose: true,
};

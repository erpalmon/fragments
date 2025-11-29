// jest.config.js (CommonJS)

const path = require("path");
const { config } = require("dotenv");

const envFile = path.join(__dirname, "env.jest");

// Load Jest env vars
config({ path: envFile });

console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  verbose: true,
  testTimeout: 5000,
  testEnvironment: "node",

  transform: {},

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)",
  ],
};

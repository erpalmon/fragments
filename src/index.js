// src/index.js

// Import logger first to ensure it's available for error handling
const logger = require('./logger');

// Load environment variables from .env file (if present)
require('dotenv').config();

// Handle uncaught exceptions - log and rethrow to prevent silent failures
process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});

// Handle unhandled promise rejections - log and rethrow
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});

// Start the server
require('./server');

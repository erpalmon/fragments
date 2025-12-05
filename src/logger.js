// src/logger.js
const pino = require('pino');

// Set log level from environment or default to 'info'
const level = process.env.LOG_LEVEL || 'info';
const options = { level };

// Enable pretty printing in development or when explicitly requested, but avoid
// configuring transports during tests (reduces dependency surface)
if (
  process.env.NODE_ENV !== 'test' &&
  (process.env.NODE_ENV === 'development' || level === 'debug')
) {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname,req,res', // Cleaner output
    },
  };
}

// Export configured logger instance
module.exports = pino(options);

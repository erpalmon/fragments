// src/logger.js
const pino = require('pino');

const level = process.env.LOG_LEVEL || 'info';
const usePretty = process.env.LOG_PRETTY === 'true';

// If LOG_PRETTY is true, format logs for humans with pino-pretty.
// Otherwise, emit raw JSON (best for production/log aggregators).
module.exports = pino(
  usePretty
    ? {
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname', // optional: slimmer output
          },
        },
      }
    : { level }
);

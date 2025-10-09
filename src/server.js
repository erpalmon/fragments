// src/server.js
'use strict';

require('dotenv').config();


const app = require('./app');
const logger = require('./logger');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Start the HTTP server
const server = app.listen(PORT, HOST, () => {
  logger.info(
    { host: HOST, port: PORT, env: process.env.NODE_ENV || 'development' },
    'fragments API server listening'
  );
});

// Surface server errors
server.on('error', (err) => {
  logger.error({ err }, 'server error');
  process.exit(1);
});

// Graceful shutdown for Ctrl+C / stop
const shutdown = (signal) => {
  logger.warn({ signal }, 'received shutdown signal, closing server...');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'error during server close');
      process.exit(1);
    }
    logger.info('server closed, exiting');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = server;


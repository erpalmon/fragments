// src/server.js
'use strict';

const logger = require('./logger');
const stoppable = require('stoppable');
const app = require('./app');

// Get configuration from environment
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create server with graceful shutdown
const server = stoppable(
  app.listen(PORT, HOST, () => {
    logger.info(
      { 
        host: HOST, 
        port: PORT, 
        env: process.env.NODE_ENV || 'development' 
      },
      'Fragments API server started'
    );
  })
);

// Handle server errors
server.on('error', (err) => {
  logger.error({ err }, 'Server error');
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received - starting graceful shutdown');
  server.stop(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

module.exports = server;

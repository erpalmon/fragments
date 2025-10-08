// src/server.js

const stoppable = require('stoppable');
const logger = require('./logger');
const app = require('./app');

const port = parseInt(process.env.PORT || '8080', 10);
// Bind to all interfaces so traffic from the public IP works
const host = process.env.HOST || '0.0.0.0';

const server = stoppable(
  app.listen(port, host, () => {
    logger.info({ host, port }, 'Server started');
  })
);

module.exports = server;


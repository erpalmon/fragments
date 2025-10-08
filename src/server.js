// src/server.js

const http = require('http');
const app = require('./app');
const logger = require('./logger');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  logger.info({ host: HOST, port: PORT, env: process.env.NODE_ENV }, 'fragments API server listening');
});

server.on('error', (err) => {
  logger.error({ err }, 'server error');
  process.exit(1);
});

module.exports = server;

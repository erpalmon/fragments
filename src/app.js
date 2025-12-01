// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

const { author, version } = require('../package.json');
const logger = require('./logger');
const pino = require('pino-http')({ logger });

const auth = require('./auth');
const { createSuccessResponse, createErrorResponse } = require('./response');

const app = express();

// global middleware
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// CORS preflight
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:1234/';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Passport global initialization
const strategy = auth.strategy();
const strategyName = strategy.name || 'default';
passport.use(strategyName, strategy);
app.use(passport.initialize());

// mount all routes
app.use(require('./routes'));

// public endpoints
app.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(
    createSuccessResponse({
      status: 'ok',
      version,
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
    })
  );
});

app.get('/v1/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(
    createSuccessResponse({
      status: 'ok',
      version,
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
    })
  );
});

// 404
app.use((_req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// error handler
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json({
    status: 'error',
    error: { code: status, message }
  });
});



// Create server instance
const server = (module.exports = app);

// Only start the server if this file is run directly (not required/imported)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  
  // Start the server with error handling
  const listener = server.listen(PORT, '0.0.0.0', () => {
    const { address, port } = listener.address();
    logger.info(`Server running at http://${address === '::' ? 'localhost' : address}:${port}`);
  });

  // Handle server errors
  listener.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        logger.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Shutting down gracefully');
    listener.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

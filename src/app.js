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
passport.use(auth.strategy());
app.use(passport.initialize());

// mount all routes
app.use(require('./routes'));

// public endpoints
app.get('/', (req, res) => {
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
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, 'Error processing request');
  res.status(status).json(createErrorResponse(status, message));
});

// Start the server if this file is run directly (not required/included as a module)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;

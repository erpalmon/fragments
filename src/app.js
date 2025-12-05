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

// Global middleware
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

// Passport initialization
passport.use(auth.strategy, auth.basicAuth);
app.use(passport.initialize());

// Mount all routes
app.use(require('./routes'));

// Public endpoints
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

// 404 handler
app.use((_req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error handler
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

module.exports = app;

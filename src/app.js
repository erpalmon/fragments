// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

const { author, version } = require('../package.json');

const logger = require('./logger');
const pino = require('pino-http')({ logger });

const authenticate = require('./auth');
const { createSuccessResponse, createErrorResponse } = require('./response');

const app = express();

// ---- Global middleware ----
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// ---- Passport strategy + init (auth is applied inside routes, not globally) ----
passport.use(authenticate.strategy());
app.use(passport.initialize());

/**
 * PUBLIC Health Route at '/' (what your tests expect)
 * - JSON
 * - Cache-Control: no-cache
 */
app.get('/', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      version,
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
    })
  );
});

// (Optional) Also provide a public health at /v1/ for EC2 screenshots
app.get('/v1/', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      version,
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
    })
  );
});

/**
 * Test-only routes to exercise the error handler.
 * Jest runs with NODE_ENV='test'.
 */
if (process.env.NODE_ENV === 'test') {
  // Triggers a 500 via next(err)
  app.post('/error', (_req, _res, next) => {
    const err = new Error('test error');
    err.status = 500;
    next(err);
  });

  // Triggers a 501 via next(err)
  app.post('/error501', (_req, _res, next) => {
    const err = new Error('not implemented');
    err.status = 501;
    next(err);
  });
}

/**
 * App routes
 * IMPORTANT: do NOT mount at '/v1' here if your router already prefixes '/v1'.
 */
app.use(require('./routes'));

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// ---- Error handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;

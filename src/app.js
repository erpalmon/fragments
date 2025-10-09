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

// Preflight/CORS headers FIRST, before auth or routes
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:1234';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // If you later use cookies, also add: res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// You can keep cors() to set standard CORS headers on actual responses
app.use(cors());
app.use(compression());

// ---- Passport strategy + init (auth is applied inside routes, not globally) ----
passport.use(authenticate.strategy());
app.use(passport.initialize());

// PUBLIC health at '/'
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

// Optional health at /v1/ (handy for EC2 screenshots)
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

// Test-only error routes
if (process.env.NODE_ENV === 'test') {
  app.post('/error', (_req, _res, next) => {
    const err = new Error('test error');
    err.status = 500;
    next(err);
  });
  app.post('/error501', (_req, _res, next) => {
    const err = new Error('not implemented');
    err.status = 501;
    next(err);
  });
}

// App routes (router already prefixes /v1 and applies auth)
app.use(require('./routes'));

// 404
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error handler
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

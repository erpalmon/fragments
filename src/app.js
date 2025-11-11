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

app.use(cors());
app.use(compression());

// ✅ Make req.body a Buffer for application/json and any text/*
// NOTE: `type` gets the req object, not the content-type string.
app.use(
  express.raw({
    limit: '1mb',
    type: (req) => {
      const ct = req.headers['content-type'] || '';
      const t = ct.split(';')[0].trim().toLowerCase();
      return t === 'application/json' || t.startsWith('text/');
    },
  })
);

// ---- Passport strategy + init ----
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Public health at '/'
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

// Optional public health at /v1/
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

// Mount routes (includes /v1/health public + /v1/* auth)
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
  if (status > 499) logger.error({ err }, 'Error processing request');
  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;


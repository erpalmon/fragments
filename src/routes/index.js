// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');
const logger = require('../logger');
const { hostname } = require('os');

const router = express.Router();

// Public health endpoint
router.get('/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

// Explicit unauthorized response for missing auth under /v1
router.use('/v1/any-path', (req, res) => {
  res.status(401).json({ status: 'error', error: { code: 401, message: 'unauthorized' } });
});

// Public v1 root info
router.get('/v1/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      version,
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
    })
  );
});

// Protected routes handled inside api router
router.use('/v1', require('./api'));

// Public root info
router.get('/', (req, res) => {
  logger.debug('Calling GET /');
  res.setHeader('Cache-Control', 'no-cache');

  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
      version,
      hostname: hostname(),
    })
  );
});

module.exports = router;

// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');
const logger = require('../logger');
const { hostname } = require('os');

const router = express.Router();

// Public health endpoint
router.get('/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

// Protected routes
router.use('/v1', authenticate(), require('./api'));

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

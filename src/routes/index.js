// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');

const router = express.Router();

/**
 * Public health check at /v1/health (helpful for EC2 screenshots)
 * Keep it BEFORE the /v1 auth middleware so it’s public.
 */
router.get('/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

/**
 * Expose all API routes at /v1/* and protect them with auth.
 */
router.use('/v1', authenticate(), require('./api'));

/**
 * Public health/info at root /
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/erpalmon/fragments',
      version,
    })
  );
});

module.exports = router;

// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const basicAuth = require('../auth/basic-auth');   // <- FIXED
const { createSuccessResponse } = require('../response');

const router = express.Router();

// Public health endpoint
router.get('/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

// Protected routes
router.use('/v1', basicAuth.authenticate(), require('./api'));

// Public root info
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

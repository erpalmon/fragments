// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const contentType = require('content-type');
const crypto = require('crypto');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Create a router on which to mount our API endpoints
const router = express.Router();

// GET /v1/fragments
router.get('/fragments', require('./get'));

// Accept only text/plain for Assignment 1
const isSupported = (t) => t === 'text/plain';

// Raw body parser ONLY for supported types (gives Buffer at req.body)
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return isSupported(type);
      } catch {
        return false;
      }
    },
  });

// POST /v1/fragments (create a fragment)
router.post('/fragments', rawBody(), async (req, res, next) => {
  try {
    // If raw parser didn’t parse it, we don’t have a Buffer → unsupported type
    if (!Buffer.isBuffer(req.body)) {
      req.log?.warn({ ct: req.headers['content-type'] }, 'unsupported content type');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }

    const { type } = contentType.parse(req);
    const data = req.body;

    // TODO: replace with your Fragment class + in-memory DB persistence
    const id = crypto.randomUUID();
    const fragment = {
      id,
      ownerId: req.user, // will be hashed if you use the custom authorize middleware
      type,
      size: data.length,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    // Build Location header using API_URL or current host as fallback
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const base = process.env.API_URL || `${proto}://${req.headers.host}`;
    const location = `${base}/v1/fragments/${id}`;

    req.log?.info({ id, type, size: fragment.size }, 'fragment created');
    return res.status(201).set('Location', location).json(createSuccessResponse({ fragment }));
  } catch (err) {
    req.log?.error({ err }, 'POST /v1/fragments failed');
    return next(err);
  }
});

module.exports = router;


// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
/*
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));
// Other routes (POST, DELETE, etc.) will go here later on...

module.exports = router;
*/

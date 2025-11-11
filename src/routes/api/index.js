// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// GET /v1/fragments (list)
router.get('/fragments', require('./get'));

// --- Put specific routes FIRST ---
router.get('/fragments/:id/info', require('./get-by-id-info'));  // metadata
router.get('/fragments/:id.:ext', require('./get-by-id-ext'));   // conversion
router.get('/fragments/:id', require('./get-by-id'));            // raw data

// Raw body parser (Buffer for supported types)
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

// POST /v1/fragments (create)
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;

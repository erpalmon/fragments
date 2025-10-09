// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// GET /v1/fragments (list)
router.get('/fragments', require('./get'));

// GET /v1/fragments/:id (get one)
router.get('/fragments/:id', require('./get-by-id'));

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

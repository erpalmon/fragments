const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// GET /v1/fragments (already exists)
router.get('/fragments', require('./get'));

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

// ✅ Mount the POST handler from its own file
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;

const express = require('express');
const router = express.Router();
const { Fragment } = require('../../../src/model/fragment');
const { createSuccessResponse } = require('../../response');

// POST /v1/fragments
router.post('/', async (req, res) => {
  try {
    const fragment = new Fragment({
      ownerId: req.user.id,
      type: req.get('Content-Type') || 'text/plain',
      size: parseInt(req.get('Content-Length') || '0'),
    });
    await fragment.save();
    await fragment.setData(req.body);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;

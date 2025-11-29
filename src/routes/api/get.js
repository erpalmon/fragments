// src/routes/api/get.js
const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user.
 * ?expand=1|true returns full fragment meta objects; otherwise IDs only.
 */
module.exports = async (req, res) => {
  const expand = req.query.expand === '1' || req.query.expand === 'true';
  const fragments = await Fragment.byUser(req.user, expand);
  res.status(200).json(createSuccessResponse({ fragments }));
};

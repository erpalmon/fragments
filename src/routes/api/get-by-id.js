// src/routes/api/get-by-id.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Return the fragment's data by id.
 * A1 scope: only text/plain is supported, and we return raw text.
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (fragment.type !== 'text/plain') {
      return res.status(415).json(createErrorResponse(415, 'Only text/plain supported'));
    }

    const data = await fragment.getData();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(data);
  } catch {
    return res.status(404).json(createErrorResponse(404, 'Not found'));
  }
};

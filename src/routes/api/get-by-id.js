// src/routes/api/get-by-id.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Return the fragment's data by id.
 * A2: return the stored bytes with the fragment's Content-Type.
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    res.set('Content-Type', fragment.mimeType);
    res.set('Cache-Control', 'no-cache');
    return res.status(200).send(data);
  } catch {
    return res.status(404).json(createErrorResponse(404, 'Not found'));
  }
};

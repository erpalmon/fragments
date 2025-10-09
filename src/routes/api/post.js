// src/routes/api/post.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    // Must be a Buffer → means supported type
    if (!Buffer.isBuffer(req.body)) {
      req.log?.warn({ ct: req.headers['content-type'] }, 'Unsupported Content-Type');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }

    const { type } = contentType.parse(req);

    // Create + save metadata & data
    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.save();
    await fragment.setData(req.body);

    // Build absolute Location
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const base = process.env.API_URL || `${proto}://${req.headers.host}`;
    const location = `${base}/v1/fragments/${fragment.id}`;

    req.log?.info({ id: fragment.id, type: fragment.type, size: fragment.size }, 'fragment created');

    const payload = fragment.toJSON ? fragment.toJSON() : fragment;
    return res.status(201).set('Location', location).json(createSuccessResponse({ fragment: payload }));
  } catch (err) {
    req.log?.error({ err }, 'POST /v1/fragments failed');
    return next(err);
  }
};

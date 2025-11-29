// src/routes/api/post.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    // Must be a Buffer → our express.raw() guarantees this for allowed types
    if (!Buffer.isBuffer(req.body)) {
      req.log?.warn({ ct: req.headers['content-type'] }, 'Unsupported Content-Type (not buffer)');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }

    // Normalize/parse Content-Type (strip charset)
    const header = req.headers['content-type'] || '';
    const { type } = contentType.parse(header); // e.g., 'text/markdown' or 'application/json'

    const allowed = type === 'application/json' || type.startsWith('text/');
    if (!allowed) {
      req.log?.warn({ ct: type }, 'Unsupported Content-Type');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }

    // Create + save
    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.save();
    await fragment.setData(req.body); // raw bytes

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

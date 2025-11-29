// src/routes/api/get-by-id-ext.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const { mdToHtml } = require('../../utils/convert');

module.exports = async (req, res) => {
  try {
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Not found'));
    }

    const data = await fragment.getData();   // Buffer
    const srcType = fragment.type;           // e.g., "text/markdown"

    // A2 scope: support ONLY Markdown -> HTML
    if (srcType === 'text/markdown' && ext === 'html') {
      const out = mdToHtml(data);
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(out);
    }

    return res
      .status(415)
      .json(createErrorResponse(415, 'unsupported conversion for A2'));
  } catch {
    return res.status(404).json(createErrorResponse(404, 'Not found'));
  }
};

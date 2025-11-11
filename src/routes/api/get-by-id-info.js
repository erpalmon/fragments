// src/routes/api/get-by-id-info.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    // TEMP: prove this handler runs and show identifiers we query with
    logger.info({ route: 'info', id, ownerId }, 'HIT /v1/fragments/:id/info');

    // Use the exact same lookup style as your working raw route
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      logger.warn({ id, ownerId }, 'info: fragment not found');
      return res.status(404).json(createErrorResponse(404, 'not found'));
    }

    // Return only metadata
    return res
      .status(200)
      .json(createSuccessResponse({ fragment: fragment.toJSON() }));
  } catch (err) {
    logger.error({ err }, 'info: exception');
    return res.status(500).json(createErrorResponse(500, err.message));
  }
};

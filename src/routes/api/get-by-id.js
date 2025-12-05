// src/routes/api/get-by-id.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Get raw fragment data by ID
 * GET /v1/fragments/:id
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  logger.info({ id, ownerId }, `Fetching fragment data for ${id}`);

  try {
    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      logger.warn({ id, ownerId }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Get the fragment data
    const data = await fragment.getData();
    logger.debug(
      {
        id,
        type: fragment.type,
        size: data.length,
      },
      'Successfully retrieved fragment data'
    );

    // Set response headers
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Cache-Control', 'no-cache');

    // For text content, set charset if not already specified
    if (fragment.type.startsWith('text/') && !fragment.type.includes('charset')) {
      res.setHeader('Content-Type', `${fragment.type}; charset=utf-8`);
    }

    // Return the raw fragment data
    return res.status(200).send(data);
  } catch (err) {
    logger.error(
      {
        err,
        fragmentId: id,
        ownerId,
      },
      'Error fetching fragment data'
    );

    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    return res.status(500).json(createErrorResponse(500, 'Error retrieving fragment data'));
  }
};

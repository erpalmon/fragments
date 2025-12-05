const { Fragment } = require('../../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn({ id, ownerId }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const data = await fragment.getData();

    // Handle different content types
    if (fragment.type === 'application/json') {
      try {
        // Parse JSON to validate it's valid, but we'll return the raw data
        JSON.parse(data.toString());
      } catch (err) {
        logger.warn({ err }, 'Error parsing JSON fragment');
        return res.status(500).json(createErrorResponse(500, 'Error parsing fragment data'));
      }
    }

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
    res.setHeader('Content-Length', data.length);

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
        fragmentId: req.params.id,
        ownerId: req.user,
      },
      'Error fetching fragment data'
    );

    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    return res.status(500).json(createErrorResponse(500, 'Error retrieving fragment data'));
  }
};

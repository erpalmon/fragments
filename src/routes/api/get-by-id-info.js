// src/routes/api/get-by-id-info.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Get metadata for a specific fragment
 * GET /v1/fragments/:id/info
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  logger.info({ id, ownerId }, `Fetching metadata for fragment ${id}`);

  try {
    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);
    
    if (!fragment) {
      logger.warn({ id, ownerId }, 'Fragment not found');
      return res.status(404).json(
        createErrorResponse(404, 'Fragment not found')
      );
    }

    // Prepare response data
    const fragmentData = {
      id: fragment.id,
      created: fragment.created,
      updated: fragment.updated,
      type: fragment.type,
      size: fragment.size,
      formats: fragment.formats || []
    };

    logger.debug({ fragmentData }, 'Successfully retrieved fragment metadata');
    
    // Return fragment metadata
    return res.status(200).json(
      createSuccessResponse({ fragment: fragmentData })
    );

  } catch (err) {
    logger.error({ 
      err, 
      fragmentId: id, 
      ownerId 
    }, 'Error fetching fragment metadata');

    if (err.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse(404, 'Fragment not found')
      );
    }

    return res.status(500).json(
      createErrorResponse(500, 'Error retrieving fragment metadata')
    );
  }
};

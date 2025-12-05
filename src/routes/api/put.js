// src/routes/api/put.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const contentType = require('content-type');

/**
 * Update an existing fragment's data
 * PUT /v1/fragments/:id
 */
module.exports.updateFragment = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;
  const header = req.headers['content-type'] || '';

  logger.info({ id, ownerId }, `Updating fragment ${id}`);

  try {
    // Validate content type
    if (!header) {
      logger.warn('Missing Content-Type header');
      return res.status(400).json(
        createErrorResponse(400, 'Content-Type is required')
      );
    }

    // Parse and validate content type
    const { type } = contentType.parse(header);
    const allowed = type === 'application/json' || type.startsWith('text/');
    
    if (!allowed) {
      logger.warn({ type }, 'Unsupported Content-Type');
      return res.status(415).json(
        createErrorResponse(415, 'Unsupported Content-Type')
      );
    }

    // Get existing fragment
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn({ id }, 'Fragment not found');
      return res.status(404).json(
        createErrorResponse(404, 'Fragment not found')
      );
    }

    // Verify type hasn't changed
    if (fragment.type !== type) {
      logger.warn(
        { currentType: fragment.type, newType: type },
        'Fragment type cannot be changed'
      );
      return res.status(400).json(
        createErrorResponse(400, 'Fragment type cannot be changed after creation')
      );
    }

    // Update fragment data
    await fragment.setData(req.body);
    await fragment.save();

    logger.info(
      { id, type, size: req.body.length },
      'Fragment updated successfully'
    );

    // Build location URL
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:8080';
    const base = process.env.API_URL || `${proto}://${host}`;
    const location = `${base}/v1/fragments/${fragment.id}`;

    // Set response headers
    res.setHeader('Location', location);
    res.setHeader('Access-Control-Expose-Headers', 'Location');

    // Return success response
    return res.status(200).json(
      createSuccessResponse({ fragment })
    );

  } catch (err) {
    logger.error({ err, id }, 'Error updating fragment');
    
    if (err.type === 'InvalidArgumentError') {
      return res.status(400).json(
        createErrorResponse(400, 'Invalid fragment data')
      );
    }

    if (err.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse(404, 'Fragment not found')
      );
    }

    return res.status(500).json(
      createErrorResponse(500, 'Error updating fragment')
    );
  }
};

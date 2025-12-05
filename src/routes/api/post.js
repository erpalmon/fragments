// src/routes/api/post.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const contentType = require('content-type');

/**
 * Create a new fragment
 * POST /v1/fragments
 */
module.exports.createFragment = async (req, res) => {
  const ownerId = req.user;
  const header = req.headers['content-type'] || '';
  
  try {
    // Parse and validate Content-Type
    const { type } = contentType.parse(header);
    const allowed = type === 'application/json' || type.startsWith('text/');
    
    if (!allowed) {
      logger.warn({ type }, 'Unsupported Content-Type');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }

    // Create and save fragment
    const fragment = new Fragment({ ownerId, type });
    await fragment.save();
    await fragment.setData(req.body);

    // Build location URL
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:8080';
    const base = process.env.API_URL || `${proto}://${host}`;
    const location = `${base}/v1/fragments/${fragment.id}`;

    logger.info({ id: fragment.id, type, size: fragment.size }, 'Fragment created');
    
    // Set response headers
    res.setHeader('Location', location);
    res.setHeader('Access-Control-Expose-Headers', 'Location');
    
    // Return success response
    return res.status(201).json(
      createSuccessResponse({ fragment })
    );

  } catch (err) {
    if (err.type === 'InvalidArgumentError') {
      logger.warn({ err }, 'Invalid fragment data');
      return res.status(400).json(createErrorResponse(400, 'Invalid fragment data'));
    }
    
    logger.error({ err }, 'Error creating fragment');
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

// src/routes/api/delete.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Delete a fragment by ID
 */
module.exports = async (req, res, next) => {
  const { id } = req.params;
  const ownerId = req.user;

  logger.info({ ownerId, id }, `Calling DELETE ${req.originalUrl}`);

  try {
    await Fragment.delete(ownerId, id);
    logger.info('Fragment deleted successfully');
    return res.status(200).json(createSuccessResponse({}));
  } catch (err) {
    // Make DELETE idempotent: treat missing as already deleted
    if (/(not found|missing entry|NoSuchKey|NoSuchBucket)/i.test(err.message || '')) {
      logger.warn({ id }, 'Fragment not found, treating as already deleted');
      return res.status(200).json(createSuccessResponse({}));
    }
    
    logger.error({ err, id }, 'Error deleting fragment');
    const errorResponse = createErrorResponse(500, 'Failed to delete fragment');
    return res.status(500).json(errorResponse);
  }
};

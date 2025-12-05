const { Fragment } = require('../../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res, _next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn({ id }, 'Fragment not found, treating as already deleted');
      return res.status(200).json(createSuccessResponse({}));
    }

    await fragment.delete();
    logger.info({ id }, 'Fragment deleted successfully');
    return res.status(200).json(createSuccessResponse({}));
  } catch (err) {
    logger.error({ err, id: req.params.id }, 'Error deleting fragment');
    const errorResponse = createErrorResponse(500, 'Failed to delete fragment');
    return res.status(500).json(errorResponse);
  }
};

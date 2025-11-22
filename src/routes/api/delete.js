// src/routes/api/delete.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const ownerId = req.user;
    const { id } = req.params;

    // temp: prove we hit this handler
    require('../../logger').info({ ownerId, id }, 'DELETE handler invoked');

    // Perform delete (S3 + metadata). Data layer tolerates missing metadata.
    await Fragment.delete(ownerId, id);

    return res.status(200).json(createSuccessResponse({}));
  } catch (err) {
    // temp: log the error so we can widen our idempotent match if needed
    require('../../logger').error({ err }, 'DELETE error');

    // Make DELETE idempotent: treat missing as already deleted.
    if (err && /(not found|missing entry|NoSuchKey|NoSuchBucket)/i.test(err.message || '')) {
      return res.status(200).json(createSuccessResponse({}));
    }
    return next(err);
  }
};
// src/response.js

/**
 * A successful response looks like:
 *
 * {
 *   "status": "ok",
 *   ...
 * }
 */
module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    ...(data || {}), // “spread” the key/value pairs from `data` into the object
  };
};
/**
 * An error response looks like:
 *
 * {
 *   "status": "error",
 *   "error": {
 *     "code": 400,
 *     "message": "invalid request, missing ...",
 *   }
 * }
 */
module.exports.createErrorResponse = function (code, message) {
  return {
    status: 'error',
    error: {
      code,
      message,
    },
  };
};

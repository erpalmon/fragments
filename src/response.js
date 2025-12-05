// src/response.js

/**
 * Creates a standardized success response
 * @param {Object} [data={}] - Optional data to include in the response
 * @returns {Object} Standardized success response
 * @example
 * // returns { status: 'ok', id: 1 }
 * createSuccessResponse({ id: 1 })
 */
module.exports.createSuccessResponse = (data = {}) => {
  return {
    status: 'ok',
    ...data,
  };
};

/**
 * Creates a standardized error response
 * @param {number} code - HTTP status code
 * @param {string} message - Error message
 * @returns {Object} Standardized error response
 * @example
 * // returns { status: 'error', error: { code: 400, message: 'Bad request' } }
 * createErrorResponse(400, 'Bad request')
 */
module.exports.createErrorResponse = (code, message, details = {}) => {
  return {
    status: 'error',
    error: {
      code,
      message,
      ...details,
    },
  };
};

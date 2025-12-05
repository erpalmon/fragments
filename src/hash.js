//src/hash.js

const { createHash } = require('crypto');

/**
 * Hashes an email address for privacy-preserving storage
 * @param {string} email - The email address to hash
 * @returns {string} SHA-256 hash of the email in hex format
 * @throws {Error} If email is not provided
 */
function hash(email = '') {
  return createHash('sha256').update(email).digest('hex');
}

module.exports = hash;

// src/hash.js
const { createHash } = require('crypto');

/**
 * Hash the email to store it in a privacy-preserving way
 * @param {string} email
 * @returns {string} hashed email
 */
function hash(email) {
  if (!email) {
    throw new Error('Email is required');
  }
  return createHash('sha256').update(email).digest('hex');
}

module.exports = hash;

/**
 * Token Blacklist
 * Stores invalidated tokens until they expire
 * In production, use Redis or database for distributed systems
 */

// In-memory blacklist (for development)
// In production, use Redis or database
const blacklist = new Set();

/**
 * Add token to blacklist
 * @param {String} token - JWT token to blacklist
 * @param {Number} expiresIn - Token expiration time in seconds
 */
const addToBlacklist = (token, expiresIn = 3600) => {
  blacklist.add(token);

  // Remove token from blacklist after it expires
  setTimeout(() => {
    blacklist.delete(token);
  }, expiresIn * 1000);
};

/**
 * Check if token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if token is blacklisted
 */
const isBlacklisted = (token) => {
  return blacklist.has(token);
};

/**
 * Clear all blacklisted tokens (for testing)
 */
const clearBlacklist = () => {
  blacklist.clear();
};

module.exports = {
  addToBlacklist,
  isBlacklisted,
  clearBlacklist,
};

const jwt = require("jsonwebtoken");

/**
 * Sign JWT token
 * @param {Object} payload - Token payload containing _id
 * @param {String} secret - JWT secret key
 * @param {Number} expireTime - Expiration time in seconds
 * @returns {String} JWT token
 */
const signToken = ({ _id, secret, expireTime }) => {
  const tokenSecret =
    secret ||
    process.env.JWT_SECRET ||
    "22622bd8d7b090c4af692d067ddd68dad0c2251698709f182952bdd53f290d07f3af612f2006051b09b5709f96ada2b87411c79c49b68c1a98ca38969092132c";
  const expiresIn = expireTime || parseInt(process.env.JWT_EXPIRE_TIME) || 3600;

  return jwt.sign({ _id }, tokenSecret, { expiresIn });
};

/**
 * Check if user has admin permission
 * @param {Object} user - User object
 * @returns {Boolean} True if user is admin
 */
const isAdmin = (user) => {
  if (!user || !user.permission) {
    return false;
  }

  // Check if permission is populated or just an ID
  if (
    typeof user.permission === "object" &&
    user.permission.description === "admin"
  ) {
    return true;
  }

  return false;
};

module.exports = { signToken, isAdmin };

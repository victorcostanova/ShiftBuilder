const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isBlacklisted } = require('../utils/tokenBlacklist');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Check if token is blacklisted (logged out)
    if (isBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been invalidated. Please login again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    
    // Attach user info to request with populated permission
    const user = await User.findById(decoded._id)
      .select('-password')
      .populate('permission', 'description');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.token = token; // Store token for logout
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // Ensure permission is populated if it's not already
  let user = req.user;
  if (!user.permission || (typeof user.permission === 'object' && !user.permission.description)) {
    user = await User.findById(user._id).populate('permission', 'description');
    req.user = user;
  }

  // Check if user has admin permission
  const permissionDesc = user.permission?.description;
  if (permissionDesc === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

module.exports = { authenticateToken, isAdmin };


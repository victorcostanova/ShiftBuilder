const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  createUser,
  createAdmin,
  login,
  logout
} = require('./Controller');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// GET /api/user/ - Get all users (Admin only)
router.get('/', authenticateToken, isAdmin, getAllUsers);

// GET /api/user/:id - Get user by ID
router.get('/:id', getUserById);

// PATCH /api/user/:id - Update user by ID
router.patch('/:id', updateUserById);

// DELETE /api/user/:id - Delete user (Admin only)
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

// POST /api/user/ - Create user (regular)
router.post('/', createUser);

// POST /api/user/admin - Create admin user
router.post('/admin', createAdmin);

// POST /api/user/login - Login user
router.post('/login', login);

// POST /api/user/logout - Logout user
router.post('/logout', authenticateToken, logout);

module.exports = router;


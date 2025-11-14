const express = require('express');
const router = express.Router();
const {
  getAllComments,
  getCommentById,
  createComment,
  updateCommentById,
  deleteComment,
  getAllUserComments
} = require('./Controller');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// GET /api/comment/ - Get all comments (Admin only)
router.get('/', authenticateToken, isAdmin, getAllComments);

// GET /api/comment/:id - Get comment by ID
router.get('/:id', getCommentById);

// GET /api/comment/user/:userId - Get all comments by user ID
router.get('/user/:userId', getAllUserComments);

// POST /api/comment - Create comment
router.post('/', createComment);

// PATCH /api/comment/ - Update comment by ID
router.patch('/', updateCommentById);

// DELETE /api/comment/:id - Delete comment (Admin only)
router.delete('/:id', authenticateToken, isAdmin, deleteComment);

module.exports = router;


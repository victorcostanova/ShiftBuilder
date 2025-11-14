const express = require('express');
const router = express.Router();
const {
  getAllShifts,
  getShiftById,
  getShiftsByUserId,
  updateShiftById,
  deleteShift,
  addShift
} = require('./Controller');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// GET /api/shifts/ - Get all shifts (Admin only) or Get shift by ID if _id in query or Get shifts by userId
router.get('/', async (req, res, next) => {
  // If _id is provided in query or body, get shift by ID
  if (req.query._id || req.body._id) {
    return getShiftById(req, res);
  }
  // If userId is provided, get shifts by userId (requires authentication)
  if (req.query.userId || req.body.userId) {
    // Skip to next middleware (authenticateToken)
    return next();
  }
  // Otherwise, get all shifts (requires admin) - chain middleware
  next();
}, authenticateToken, async (req, res, next) => {
  // If userId is in query, handle getShiftsByUserId
  if (req.query.userId || req.body.userId) {
    return getShiftsByUserId(req, res);
  }
  // Otherwise continue to isAdmin middleware
  next();
}, isAdmin, getAllShifts);

// PATCH /api/shifts - Update shift by ID
router.patch('/', updateShiftById);

// DELETE /api/shifts - Delete shift (User can delete own shifts, Admin can delete any)
router.delete('/', authenticateToken, deleteShift);

// POST /api/shifts/ - Add shift
router.post('/', addShift);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  getAllPermissions,
  addPermission
} = require('./Controller');

// GET /api/permission - Get all permissions
router.get('/', getAllPermissions);

// POST /api/permission - Add permission (Only by hands)
router.post('/', addPermission);

module.exports = router;


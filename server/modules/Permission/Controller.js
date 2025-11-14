const { Permission } = require('./Module');

/**
 * Get all permissions
 * Input: (empty)
 */
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add permission (Only by hands - manual database entry)
 * This endpoint is provided but permissions should be added manually to the database
 */
const addPermission = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || !['admin', 'regular_user'].includes(description)) {
      return res.status(400).json({ error: 'Invalid permission description. Must be "admin" or "regular_user"' });
    }
    
    const permission = new Permission({ description });
    await permission.save();
    
    res.status(201).json(permission);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Permission already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPermissions,
  addPermission
};


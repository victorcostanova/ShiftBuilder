const { Shift, User } = require('./Module');

/**
 * Get all shifts (Admin only)
 * Input: {user: {}}
 */
const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('userId', 'username email firstname lastname')
      .sort({ created: -1 });
    
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get shifts by user ID
 * Input: {userId: _id} in query or body
 */
const getShiftsByUserId = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const shifts = await Shift.find({ userId })
      .populate('userId', 'username email firstname lastname')
      .sort({ created: -1 });
    
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get shift by ID
 * Input: {_id: _id} - can be in query or body
 */
const getShiftById = async (req, res) => {
  try {
    const _id = req.query._id || req.body._id;
    if (!_id) {
      return res.status(400).json({ error: '_id is required' });
    }
    
    const shift = await Shift.findById(_id)
      .populate('userId', 'username email firstname lastname');
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update shift by ID
 * Input: {_id: _id, shift: {}}
 */
const updateShiftById = async (req, res) => {
  try {
    const { _id, shift: shiftData } = req.body;
    
    // If shiftName is being updated, validate uniqueness
    if (shiftData.shiftName !== undefined) {
      if (!shiftData.shiftName || !shiftData.shiftName.trim()) {
        return res.status(400).json({ error: 'Shift name is required' });
      }
      
      // Check if shiftName already exists (excluding current shift)
      const existingShift = await Shift.findOne({ 
        shiftName: { $regex: new RegExp(`^${shiftData.shiftName.trim()}$`, 'i') },
        _id: { $ne: _id }
      });
      if (existingShift) {
        return res.status(400).json({ error: 'Shift name already exists. Please choose a different name.' });
      }
      
      shiftData.shiftName = shiftData.shiftName.trim();
    }
    
    shiftData.updated = new Date();
    
    const shift = await Shift.findByIdAndUpdate(
      _id,
      { $set: shiftData },
      { new: true, runValidators: true }
    ).populate('userId', 'username email firstname lastname');
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    // Handle MongoDB unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Shift name already exists. Please choose a different name.' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete shift (User can delete own shifts, Admin can delete any)
 * Input: {_id: _id, user: {}}
 */
const deleteShift = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id; // User from authenticateToken middleware
    
    // Find the shift first
    const shift = await Shift.findById(_id);
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    // Check if user is admin or owns the shift
    const isAdmin = req.user.permission?.description === 'admin';
    const ownsShift = shift.userId.toString() === userId.toString();
    
    if (!isAdmin && !ownsShift) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own shifts.' });
    }
    
    // Delete the shift
    await Shift.findByIdAndDelete(_id);
    
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add shift
 * Input: {_id: _id, shift: {}}
 */
const addShift = async (req, res) => {
  try {
    const { _id: userId, shift: shiftData } = req.body;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate shiftName is provided and not empty
    if (!shiftData.shiftName || !shiftData.shiftName.trim()) {
      return res.status(400).json({ error: 'Shift name is required' });
    }
    
    const trimmedShiftName = shiftData.shiftName.trim();
    
    // Check if shiftName already exists (case-insensitive)
    const existingShift = await Shift.findOne({ 
      shiftName: { $regex: new RegExp(`^${trimmedShiftName}$`, 'i') }
    });
    if (existingShift) {
      return res.status(400).json({ error: 'Shift name already exists. Please choose a different name.' });
    }
    
    const shift = new Shift({
      userId,
      start: shiftData.start,
      end: shiftData.end,
      perHour: shiftData.perHour,
      place: shiftData.place,
      shiftName: trimmedShiftName
    });
    
    await shift.save();
    
    const populatedShift = await Shift.findById(shift._id)
      .populate('userId', 'username email firstname lastname');
    
    res.status(201).json(populatedShift);
  } catch (error) {
    // Handle MongoDB unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Shift name already exists. Please choose a different name.' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllShifts,
  getShiftById,
  getShiftsByUserId,
  updateShiftById,
  deleteShift,
  addShift
};


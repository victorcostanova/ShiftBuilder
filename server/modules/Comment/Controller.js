const { Comment, User } = require('./Module');

/**
 * Get all comments (Admin only)
 * Input: {user: {}}
 */
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userId', 'username email firstname lastname')
      .populate('shiftId', 'start end place perHour')
      .sort({ created: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get comment by ID
 * Input: {_id: _id}
 */
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id)
      .populate('userId', 'username email firstname lastname')
      .populate('shiftId', 'start end place perHour');
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create comment
 * Input: {comment: {}}
 */
const createComment = async (req, res) => {
  try {
    const { comment: commentData } = req.body;
    
    // Verify user exists
    const user = await User.findById(commentData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const comment = new Comment({
      userId: commentData.userId,
      shiftId: commentData.shiftId || null,
      description: commentData.description
    });
    
    await comment.save();
    
    // Add comment to user's comments array
    await User.findByIdAndUpdate(commentData.userId, {
      $push: { comments: comment._id }
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username email firstname lastname')
      .populate('shiftId', 'start end place perHour');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update comment by ID
 * Input: {_id: _id, comment: {}}
 */
const updateCommentById = async (req, res) => {
  try {
    const { _id, comment: commentData } = req.body;
    
    commentData.updated = new Date();
    
    const comment = await Comment.findByIdAndUpdate(
      _id,
      { $set: commentData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username email firstname lastname')
      .populate('shiftId', 'start end place perHour');
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete comment (Admin only)
 * Input: {_id: _id, user: {}}
 */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Remove comment from user's comments array
    await User.findByIdAndUpdate(comment.userId, {
      $pull: { comments: comment._id }
    });
    
    await Comment.findByIdAndDelete(id);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all comments by user ID
 * Input: {userId: _id}
 * Returns: All comments created by user
 */
const getAllUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await Comment.find({ userId })
      .populate('userId', 'username email firstname lastname')
      .populate('shiftId', 'start end place perHour')
      .sort({ created: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateCommentById,
  deleteComment,
  getAllUserComments
};


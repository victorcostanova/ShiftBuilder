const { User, Permission } = require("./Module");
const { signToken } = require("../../utils/auth");
const bcrypt = require("bcryptjs");
const Shift = require("../../models/Shift");
const Comment = require("../../models/Comment");
const mongoose = require("mongoose");

/**
 * Get all users (Admin only)
 * Input: {user: {}}
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("permission", "description")
      .populate("comments", "_id userId shiftId description created updated");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user by ID
 * Input: _id: _id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      .populate("permission", "description")
      .populate("comments", "_id userId shiftId description created updated");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user by ID
 * Input: {_id: _id, user: {}}
 */
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user: userData } = req.body;

    // Prepare update data
    const updateData = {};

    // Map fields from userData to updateData
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.username !== undefined)
      updateData.username = userData.username;
    if (userData.firstname !== undefined)
      updateData.firstname = userData.firstname;
    if (userData.lastname !== undefined)
      updateData.lastname = userData.lastname;
    if (userData.birthDate !== undefined) {
      updateData.birthDate = userData.birthDate
        ? new Date(userData.birthDate)
        : null;
    }

    // If password is being updated (as 'pass'), hash it
    if (userData.pass) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(userData.pass, salt);
    }

    updateData.updated = new Date();

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("permission", "description")
      .populate("comments", "_id userId shiftId description created updated");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete user (Admin only)
 * Input: {_id: _id, user: {}}
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Convert id to ObjectId to ensure proper matching
    const userId = new mongoose.Types.ObjectId(id);

    // Verify user exists before attempting deletion
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    // First, get all shift IDs that belong to this user (before deletion)
    // This is needed to delete comments that reference these shifts
    const userShifts = await Shift.find({ userId: userId });
    const shiftIds = userShifts.map((shift) => shift._id);
    console.log(`Found ${userShifts.length} shifts for user ${id}`);

    // Delete comments that reference these shifts (if any)
    let shiftCommentDeleteCount = 0;
    if (shiftIds.length > 0) {
      const shiftCommentDeleteResult = await Comment.deleteMany({
        shiftId: { $in: shiftIds },
      });
      shiftCommentDeleteCount = shiftCommentDeleteResult.deletedCount;
      console.log(
        `Deleted ${shiftCommentDeleteCount} comments associated with user's shifts`
      );
    }

    // Delete all shifts associated with this user
    const shiftDeleteResult = await Shift.deleteMany({ userId: userId });
    console.log(
      `Deleted ${shiftDeleteResult.deletedCount} shifts for user ${id}`
    );

    // Delete all comments directly associated with this user
    const commentDeleteResult = await Comment.deleteMany({ userId: userId });
    console.log(
      `Deleted ${commentDeleteResult.deletedCount} comments for user ${id}`
    );

    // Then delete the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User and associated shifts and comments deleted successfully",
      deletedShifts: shiftDeleteResult.deletedCount,
      deletedComments:
        commentDeleteResult.deletedCount + shiftCommentDeleteCount,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create user
 * Input: {email: email, pass: pass, firstname: firstname, lastname: lastname}
 */
const createUser = async (req, res) => {
  try {
    const {
      email,
      pass: password,
      firstname,
      lastname,
      username,
      birthDate,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    // Get regular user permission (default)
    const regularPermission = await Permission.findOne({
      description: "regular_user",
    });
    if (!regularPermission) {
      return res
        .status(500)
        .json({ error: "Regular user permission not found" });
    }

    const user = new User({
      email,
      password,
      firstname,
      lastname,
      username: username || email.split("@")[0],
      birthDate: birthDate ? new Date(birthDate) : null,
      permission: regularPermission._id,
      comments: [],
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("permission", "description");

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login user
 * Input: {username: username, pass: pass}
 * Returns: JWT token
 */
const login = async (req, res) => {
  try {
    const { username, pass: password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Populate permission to ensure we have the description
    await user.populate("permission", "description");

    // Ensure permission is properly formatted
    let permissionData = null;
    if (user.permission) {
      if (typeof user.permission === "object" && user.permission.description) {
        permissionData = {
          _id: user.permission._id,
          description: user.permission.description,
        };
      } else {
        // If permission is still not populated, fetch it separately
        const { Permission } = require("./Module");
        const permissionId = user.permission._id || user.permission;
        const permission = await Permission.findById(permissionId);
        if (permission) {
          permissionData = {
            _id: permission._id,
            description: permission.description,
          };
        }
      }
    }

    // Generate JWT token
    const token = signToken({
      _id: user._id,
      secret: process.env.JWT_SECRET,
      expireTime: parseInt(process.env.JWT_EXPIRE_TIME) || 3600,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        birthDate: user.birthDate || null,
        permission: permissionData,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create admin user
 * Input: {email: email, pass: pass, firstname: firstname, lastname: lastname, username: username}
 * Note: This should be protected or only available during setup
 */
const createAdmin = async (req, res) => {
  try {
    const {
      email,
      pass: password,
      firstname,
      lastname,
      username,
      birthDate,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    // Get admin permission
    const adminPermission = await Permission.findOne({ description: "admin" });
    if (!adminPermission) {
      return res.status(500).json({
        error:
          "Admin permission not found. Please initialize permissions first.",
      });
    }

    const user = new User({
      email,
      password,
      firstname,
      lastname,
      username: username || email.split("@")[0],
      birthDate: birthDate ? new Date(birthDate) : null,
      permission: adminPermission._id,
      comments: [],
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("permission", "description");

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Logout user
 * Invalidates the token by adding it to blacklist
 */
const logout = async (req, res) => {
  try {
    const { addToBlacklist } = require("../../utils/tokenBlacklist");
    const token = req.token; // Token from authenticateToken middleware

    if (token) {
      // Get token expiration from JWT
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(token);
      const expiresIn = decoded?.exp
        ? decoded.exp - Math.floor(Date.now() / 1000)
        : 3600;

      // Add token to blacklist
      addToBlacklist(token, expiresIn);
    }

    res.json({
      message: "Logout successful. Token has been invalidated.",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  createUser,
  createAdmin,
  login,
  logout,
};

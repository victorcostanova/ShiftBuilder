/**
 * Script to initialize permissions in the database
 * Run this once to set up the permission collection
 */

const mongoose = require("mongoose");
const Permission = require("../models/Permission");
require("dotenv").config();

const initPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/shiftbuilder",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Check if permissions already exist
    const existingPermissions = await Permission.find();
    if (existingPermissions.length > 0) {
      console.log("Permissions already exist:", existingPermissions);
      await mongoose.connection.close();
      return;
    }

    // Create permissions
    const adminPermission = new Permission({ description: "admin" });
    const regularUserPermission = new Permission({
      description: "regular_user",
    });

    await adminPermission.save();
    await regularUserPermission.save();

    console.log("Permissions initialized successfully:");
    console.log("- admin");
    console.log("- regular_user");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error initializing permissions:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

initPermissions();

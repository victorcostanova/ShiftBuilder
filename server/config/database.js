const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/shiftbuilder";

    console.log("Attempting to connect to MongoDB...");
    console.log(
      "Connection string:",
      mongoURI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
    ); // Hide credentials in log

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(
      `   Ready State: ${
        conn.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    // Create collections if they don't exist (MongoDB creates them automatically on first insert)
    // But we can ensure they're ready by checking
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      `   Existing Collections: ${
        collections.length > 0
          ? collections.map((c) => c.name).join(", ")
          : "None (will be created on first insert)"
      }`
    );
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error("Please check:");
    console.error("  1. MongoDB is running");
    console.error("  2. MONGODB_URI in .env is correct");
    console.error("  3. Network/firewall allows connection");
    process.exit(1);
  }
};

module.exports = connectDB;

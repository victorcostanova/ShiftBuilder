const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      enum: ["admin", "regular_user"],
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Permission", permissionSchema);

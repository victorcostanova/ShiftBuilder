const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    perHour: {
      type: Number,
      required: true,
      min: 0,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    shiftName: {
      type: String,
      required: false, // Will be required after migration
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Update the updated field before saving
shiftSchema.pre("save", function (next) {
  this.updated = new Date();
  next();
});

module.exports = mongoose.model("Shift", shiftSchema);

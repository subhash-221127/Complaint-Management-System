const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    department: { type: String, required: true },
    designation: { type: String, required: true },

    status: {
      type: String,
      enum: ["Active", "On Leave"],
      default: "Active",
    },

    casesHandled: { type: Number, default: 0 },
    casesResolved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Officer", officerSchema);
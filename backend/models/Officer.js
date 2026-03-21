// models/Officer.js
const mongoose = require("mongoose");

const OfficerSchema = new mongoose.Schema(
  {
    // Custom readable ID e.g. OFF001
    officerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Linked to Department ──────────────────────────────────
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    // Stored separately for fast display without populate
    departmentName: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
    joinDate: {
      type: String,
      required: true,
    },

    // Case counts — auto-updated when complaints are assigned/resolved
    casesHandled: {
      type: Number,
      default: 0,
    },
    casesResolved: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Officer", OfficerSchema);

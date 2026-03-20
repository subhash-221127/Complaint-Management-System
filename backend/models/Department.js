// ============================================================
// models/Department.js
// ============================================================
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({

  name: { type: String, required: true, unique: true, trim: true },
  // e.g. "Roads & Potholes", "Water & Sewage", "Electricity & Lighting"

  // ── Stats (updated whenever complaints/officers change) ──
  totalComplaints:  { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  pendingComplaints:  { type: Number, default: 0 },

  totalOfficers:  { type: Number, default: 0 },
  activeOfficers: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
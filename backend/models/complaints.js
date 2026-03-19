// models/complaints.js
const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  severity: { type: String, default: "Medium" },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
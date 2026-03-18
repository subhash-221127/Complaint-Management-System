const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  priority: { type: String },
  severity: { type: String },
  department: { type: String, required: true },
  status: { type: String, default: "Pending" },
  assignedTo: { type: String, default: null },
  expectedResolvedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Third param forces collection name to match Atlas
module.exports = mongoose.model("Complaint", complaintSchema, "complaints");

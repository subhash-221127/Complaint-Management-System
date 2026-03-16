// models/complaints.js
const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  complaintId: {      
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  department: { 
    type: String, 
    required: true 
  },
  evidence: {     
    type: String
  },
  severity: {        
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "resolved"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
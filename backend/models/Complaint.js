const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },

  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department:  { type: String, required: true },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },

  // Reason given by admin when rejecting — shown to citizen
  rejectionReason: { type: String, default: '' },

  location: {
    address: { type: String, default: '' },
    lat:     { type: Number },
    lng:     { type: Number }
  },

  evidencePaths: [String],

  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer',
    default: null
  },
  assignedAt:  { type: Date, default: null },
  resolvedAt:  { type: Date, default: null },

}, { timestamps: true });

// Auto-generate complaint ID before first save (Mongoose v9 — no next())
complaintSchema.pre('save', async function () {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    const year  = new Date().getFullYear();
    this.complaintId = `CMP-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);

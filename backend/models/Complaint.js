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

  // ── MODIFIED: required: false + default: null so anonymous complaints don't crash ──
  citizenId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: false,
    default:  null,
  },

  // ── ADDED: anonymous flag — default false so all existing complaints are unaffected ──
  isAnonymous: {
    type:    Boolean,
    default: false,
  },

  officerId: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Officer',
    default: null
  },
  assignedAt:  { type: Date, default: null },
  resolvedAt:  { type: Date, default: null },

  comments: [
    {
      author:    { type: String, default: 'Unknown' },
      role:      { type: String, default: 'officer' }, // 'officer' | 'admin'
      text:      { type: String, required: true },
      createdAt: { type: Date,   default: Date.now },
    }
  ],

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
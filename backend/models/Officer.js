const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  designation: String,

  // 🔗 Reference to Department
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },

  active: {
    type: Boolean,
    default: true
  },

  casesHandled: {
    type: Number,
    default: 0
  },

  casesResolved: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.models.Officer || mongoose.model('Officer', officerSchema);

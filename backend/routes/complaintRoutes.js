const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Get all complaints or by department
router.get('/', async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  try {
    const complaints = await Complaint.find(filter).populate('department').sort({ date: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single complaint details
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('department');
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create complaint
router.post('/', async (req, res) => {
  const { title, description, department, citizen, priority } = req.body;
  try {
    const complaint = new Complaint({ title, description, department, citizen, priority });
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
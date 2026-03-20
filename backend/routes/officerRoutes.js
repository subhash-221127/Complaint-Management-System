const express = require('express');
const router = express.Router();
const Officer = require('../models/Officer');

// Get all officers or by department
router.get('/', async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  try {
    const officers = await Officer.find(filter).populate('department');
    res.json(officers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single officer details
router.get('/:id', async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).populate('department');
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    res.json(officer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
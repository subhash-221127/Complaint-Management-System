// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ── SIGNUP ──
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const newUser = await User.create({ name, email, password });
    res.status(201).json({ message: 'Signup successful', user: newUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
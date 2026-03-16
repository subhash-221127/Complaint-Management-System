const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email, password }); // plain password for now

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { id: user._id, role: user.role, name: user.name }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
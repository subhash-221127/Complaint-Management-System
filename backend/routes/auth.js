// routes/auth.js
const express = require("express");
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const Officer = require("../models/Officer");
const Admin   = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "cityfix_secret_key";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// ── Register Citizen ───────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, phone, password: hashed, address, role: "citizen" });

    const token = generateToken({ id: user._id, role: "citizen" });
    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// ── Login ──────────────────────────────────────────────────────
// Checks Admin → Officer → Citizen in order
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const lower = email.toLowerCase();

    // 1. Check Admin
    const admin = await Admin.findOne({ email: lower });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials." });
      const token = generateToken({ id: admin._id, role: admin.role });
      return res.json({
        message: "Login successful",
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      });
    }

    // 2. Check Officer
    const officer = await Officer.findOne({ email: lower }).populate("department", "name");
    if (officer) {
      const match = await bcrypt.compare(password, officer.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials." });
      if (officer.status === "Inactive") return res.status(403).json({ message: "Account is inactive." });
      const token = generateToken({ id: officer._id, officerId: officer.officerId, role: "officer" });
      return res.json({
        message: "Login successful",
        token,
        user: {
          id:          officer._id,
          officerId:   officer.officerId,
          name:        officer.name,
          email:       officer.email,
          role:        "officer",
          department:  officer.departmentName,
          designation: officer.designation,
        },
      });
    }

    // 3. Check Citizen
    const user = await User.findOne({ email: lower });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials." });
      if (!user.isActive) return res.status(403).json({ message: "Account is inactive." });
      const token = generateToken({ id: user._id, role: "citizen" });
      return res.json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email, role: "citizen" },
      });
    }

    return res.status(404).json({ message: "No account found with this email." });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;

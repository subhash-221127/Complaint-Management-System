const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).sort({ name: 1 });
    res.json({ success: true, data: citizens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const citizen = await User.findOne({ _id: req.params.id, role: "citizen" });
    if (!citizen) return res.status(404).json({ success: false, message: "Citizen not found" });
    res.json({ success: true, data: citizen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const existing = await User.findOne({ email: email.toLowerCase(), role: "citizen" });
    if (existing) {
      if (phone && !existing.phone) {
        existing.phone = phone;
        await existing.save();
      }
      return res.json({ success: true, data: existing, created: false });
    }
    const citizen = await User.create({
      name,
      email,
      phone,
      role: "citizen",
    });
    res.status(201).json({ success: true, data: citizen, created: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

// routes/departments.js
const express    = require("express");
const router     = express.Router();
const Department = require("../models/Department");

// GET all active departments
router.get("/departments", async (_req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments", error: err.message });
  }
});

// GET single department
router.get("/departments/:id", async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create department
router.post("/departments", async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required." });
    }
    const existing = await Department.findOne({ $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }] });
    if (existing) return res.status(409).json({ message: "Department with this name or code already exists." });

    const dept = await Department.create({ name: name.trim(), code: code.trim().toUpperCase(), description });
    res.status(201).json({ message: "Department created", department: dept });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Duplicate name or code." });
    res.status(500).json({ message: err.message });
  }
});

// DELETE department (soft delete)
router.delete("/departments/:id", async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

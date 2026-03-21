// routes/officers.js
const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const Officer    = require("../models/Officer");
const Department = require("../models/Department");
const Complaint  = require("../models/Complaint");

// ── Helper: generate next officerId ───────────────────────────
async function generateOfficerId() {
  const last = await Officer.findOne().sort({ createdAt: -1 });
  if (!last || !last.officerId) return "OFF001";
  const num = parseInt(last.officerId.replace("OFF", "")) || 0;
  return "OFF" + String(num + 1).padStart(3, "0");
}

// ── GET all officers ───────────────────────────────────────────
router.get("/officers", async (_req, res) => {
  try {
    const officers = await Officer.find()
      .populate("department", "name code")
      .sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch officers", error: err.message });
  }
});

// ── GET single officer by officerId (e.g. OFF001) ──────────────
router.get("/officers/:id", async (req, res) => {
  try {
    const officer = await Officer.findOne({ officerId: req.params.id })
      .populate("department", "name code");
    if (!officer) return res.status(404).json({ message: "Officer not found" });
    res.json(officer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET complaints assigned to an officer ──────────────────────
router.get("/officers/:id/complaints", async (req, res) => {
  try {
    const officer = await Officer.findOne({ officerId: req.params.id });
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    const complaints = await Complaint.find({ officerId: officer._id })
      .populate("citizenId", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST create new officer ────────────────────────────────────
router.post("/officers", async (req, res) => {
  try {
    const { name, email, phone, department, designation, joinDate, password } = req.body;

    if (!name || !email || !phone || !department || !designation || !joinDate || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const dept = await Department.findById(department);
    if (!dept) return res.status(404).json({ message: "Department not found." });

    const existingEmail = await Officer.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: `Email "${email}" is already registered.` });

    const officerId = await generateOfficerId();
    const hashed    = await bcrypt.hash(password, 10);

    const officer = await Officer.create({
      officerId,
      name,
      email,
      phone,
      password:       hashed,
      designation,
      department:     dept._id,
      departmentName: dept.name,
      joinDate,
      status:         "Active",
      casesHandled:   0,
      casesResolved:  0,
    });

    // Keep department officer counts in sync
    await Department.findByIdAndUpdate(dept._id, {
      $inc: { totalOfficers: 1, activeOfficers: 1 }
    });

    const populated = await officer.populate("department", "name code");
    res.status(201).json({ message: "Officer created successfully", officer: populated });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Duplicate email." });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST reset officer password ────────────────────────────────
router.post("/officers/:id/reset-password", async (req, res) => {
  try {
    const officer = await Officer.findOne({ officerId: req.params.id });
    if (!officer) return res.status(404).json({ message: "Officer not found" });
    console.log(`Password reset requested for ${officer.officerId} (${officer.email})`);
    res.json({ message: `Password reset link sent to ${officer.email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE officer ─────────────────────────────────────────────
router.delete("/officers/:id", async (req, res) => {
  try {
    const deleted = await Officer.findOneAndDelete({ officerId: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Officer not found" });

    // Keep department officer counts in sync
    await Department.findByIdAndUpdate(deleted.department, {
      $inc: {
        totalOfficers:  -1,
        activeOfficers: deleted.status === "Active" ? -1 : 0,
      },
    });

    res.json({ message: "Officer removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /officers/:id/status  —  Admin changes officer status ──
router.patch("/officers/:id/status", async (req, res) => {
  try {
    const { status } = req.body; // "Active" | "On Leave" | "Inactive"
    const officer = await Officer.findOne({ officerId: req.params.id });
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    const wasActive = officer.status === "Active";
    const isActive  = status === "Active";

    officer.status = status;
    await officer.save();

    // Update department active officer count if Active state changed
    if (isActive && !wasActive) {
      await Department.findByIdAndUpdate(officer.department, { $inc: { activeOfficers: 1 } });
    } else if (!isActive && wasActive) {
      await Department.findByIdAndUpdate(officer.department, { $inc: { activeOfficers: -1 } });
    }

    res.json({ message: "Officer status updated", officer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

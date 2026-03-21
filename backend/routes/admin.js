// routes/admin.js
const express    = require("express");
const router     = express.Router();
const Complaint  = require("../models/Complaint");
const User       = require("../models/User");
const Officer    = require("../models/Officer");
const Department = require("../models/Department");

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/complaints — all complaints with officer + citizen
// ─────────────────────────────────────────────────────────────────
router.get("/admin/complaints", async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("officerId", "name designation departmentName")
      .populate("citizenId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/citizens — all citizens
// ─────────────────────────────────────────────────────────────────
router.get("/admin/citizens", async (_req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).sort({ createdAt: -1 });
    res.json(citizens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/stats — dashboard summary numbers
// ─────────────────────────────────────────────────────────────────
router.get("/admin/stats", async (_req, res) => {
  try {
    const [total, pending, inProgress, resolved, rejected, citizens, officers] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: { $in: ["assigned", "in_progress"] } }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "citizen" }),
      Officer.countDocuments(),
    ]);

    res.json({ total, pending, inProgress, resolved, rejected, citizens, officers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

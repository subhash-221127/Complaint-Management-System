// routes/admin.js
const express    = require("express");
const router     = express.Router();
const Complaint  = require("../models/Complaint");
const User       = require("../models/User");
const Officer    = require("../models/Officer");
const Department = require("../models/Department");

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/stats
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

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/complaints — all, newest first
// ─────────────────────────────────────────────────────────────────
router.get("/admin/complaints", async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("officerId", "name designation departmentName officerId")
      .populate("citizenId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/complaints/today
// ─────────────────────────────────────────────────────────────────
router.get("/admin/complaints/today", async (_req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const complaints = await Complaint.find({ createdAt: { $gte: start, $lte: end } })
      .populate("officerId", "name designation departmentName")
      .populate("citizenId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/complaints/:id  (MUST be after /today)
// ─────────────────────────────────────────────────────────────────
router.get("/admin/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("officerId", "name designation departmentName officerId email phone")
      .populate("citizenId", "name email phone");
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/complaints/:id/assign
// Body: { officerId }
// ─────────────────────────────────────────────────────────────────
router.post("/admin/complaints/:id/assign", async (req, res) => {
  try {
    const { officerId } = req.body;
    if (!officerId) return res.status(400).json({ message: "officerId is required." });

    const officer   = await Officer.findById(officerId);
    if (!officer)   return res.status(404).json({ message: "Officer not found." });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    const alreadyAssigned = complaint.officerId &&
      complaint.officerId.toString() === officerId.toString();

    complaint.officerId  = officer._id;
    complaint.status     = "assigned";
    complaint.assignedAt = new Date();
    await complaint.save();

    if (!alreadyAssigned) {
      await Officer.findByIdAndUpdate(officer._id, { $inc: { casesHandled: 1 } });
    }

    const populated = await Complaint.findById(complaint._id)
      .populate("officerId", "name designation departmentName officerId email phone")
      .populate("citizenId", "name email phone");

    res.json({ message: `Complaint assigned to ${officer.name} successfully.`, complaint: populated });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign officer.", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// PATCH /api/admin/complaints/:id/reject
// Body: { reason } — reason is saved and shown to citizen
// ─────────────────────────────────────────────────────────────────
router.patch("/admin/complaints/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    if (complaint.status === "rejected") {
      return res.status(400).json({ message: "Complaint is already rejected." });
    }

    complaint.status          = "rejected";
    complaint.rejectionReason = reason ? reason.trim() : "";
    await complaint.save();

    res.json({ message: "Complaint rejected.", complaint });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject complaint.", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/admin/complaints/:id
// Only for resolved or rejected complaints
// ─────────────────────────────────────────────────────────────────
router.delete("/admin/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    if (!["resolved", "rejected"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Only resolved or rejected complaints can be deleted."
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete complaint.", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/citizens
// ─────────────────────────────────────────────────────────────────
router.get("/admin/citizens", async (_req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).sort({ createdAt: -1 });
    res.json(citizens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require("express");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const router = express.Router();

function buildComplaintQuery(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.citizenId) filter.citizen = query.citizenId;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = new Date(query.from);
    if (query.to) filter.date.$lte = new Date(query.to);
  }
  if (query.search) {
    const re = new RegExp(query.search, "i");
    filter.$or = [{ title: re }, { description: re }, { complaintId: re }];
  }
  return filter;
}

router.get("/", async (req, res) => {
  try {
    const filter = buildComplaintQuery(req.query);
    const complaints = await Complaint.find(filter)
      .sort({ date: -1 })
      .populate("citizen", "name email phone role");
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const isComplaintId = req.params.id.startsWith("COMP-");
    const complaint = await Complaint.findOne(
      isComplaintId ? { complaintId: req.params.id } : { _id: req.params.id }
    )
      .populate("citizen", "name email phone role");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      citizenId,
      department,
      category,
      priority,
      date,
      contactName,
      contactPhone,
      contactEmail,
      address,
      pincode,
      city,
      district,
      locationPin,
    } = req.body;
    if (!title || !description || !citizenId || !department) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority" });
    }
    const citizen = await User.findById(citizenId);
    if (!citizen) return res.status(404).json({ success: false, message: "Citizen not found" });

    const complaint = await Complaint.create({
      title,
      description,
      citizen: citizen._id,
      citizenName: contactName || citizen.name,
      citizenPhone: contactPhone || citizen.phone,
      citizenEmail: contactEmail || citizen.email,
      department,
      category,
      priority: priority || "Medium",
      date: date ? new Date(date) : undefined,
      address,
      pincode,
      city,
      district,
      locationPin,
    });
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

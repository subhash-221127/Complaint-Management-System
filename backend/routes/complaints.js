// routes/complaints.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/complaints");

const router = express.Router();

// ---------------------------
// Multer Setup
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ---------------------------
// POST /api/create
// ---------------------------
router.post("/create", upload.single("evidence"), async (req, res) => {
  try {
    const { title, description, location, department, severity } = req.body;

    if (!title || !description || !location || !department) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const year = new Date().getFullYear();
    const count = await Complaint.countDocuments() + 1;
    const complaintId = `CMP-${year}-${String(count).padStart(4, "0")}`;

    const complaint = new Complaint({
      complaintId,
      title,
      description,
      location,
      department,
      severity: severity || "medium",
      evidence: req.file ? req.file.filename : null,
      status: "pending"
    });

    await complaint.save();

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId,
      complaint
    });
  } catch (err) {
    console.error("Error creating complaint:", err);
    return res.status(500).json({ message: "Error creating complaint", error: err.message });
  }
});

// ---------------------------
// GET /api/mycomplaints
// ---------------------------
router.get("/mycomplaints", async (req, res) => {
  try {
    // TODO: Replace with user email or ID if you implement auth
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({ message: "Error fetching complaints", error: err.message });
  }
});

module.exports = router;
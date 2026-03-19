// routes/complaints.js
const express = require("express");
const Complaint = require("../models/complaints"); // make sure this exists

const router = express.Router();

// ---------------------------
// GET /api/complaints
// ---------------------------
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    // ✅ Fix missing fields for frontend
    const formatted = complaints.map(c => ({
      _id: c._id,
      title: c.title || "-",
      citizen: c.citizen || "Anonymous",
      department: c.department || "-",
      status: c.status || "Pending",
      priority: c.priority || "Low",
      createdAt: c.createdAt || new Date()
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// ---------------------------
// POST /api/create
// (Optional: to add complaints via API)
// ---------------------------
router.post("/create", async (req, res) => {
  try {
    const { title, description, department, severity, status } = req.body;
    if (!title || !description || !department) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const complaint = new Complaint({
  title,
  description,
  department,
  citizen: req.body.citizen || "Anonymous",
  priority: req.body.priority || "Low",
  status: req.body.status || "Pending",
  createdAt: new Date()
});

    await complaint.save();
    res.status(201).json({ message: "Complaint created", complaint });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;




// GET single complaint by ID
router.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaint" });
  }
});


// UPDATE complaint status
router.put("/complaints/:id", async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(updatedComplaint);

  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// ✅ GET complaints by user
router.get("/user/:userId", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      citizenId: req.params.userId   // IMPORTANT FIELD
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
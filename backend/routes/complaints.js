const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

function statusRegex(status) {
  return { $regex: `^${status}$`, $options: "i" };
}

function buildDateFilter(range) {
  if (!range || range === "all") return null;

  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return { $gte: start };
    case "this-week": {
      const day = start.getDay();
      const diff = (day + 6) % 7;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return { $gte: start };
    }
    case "this-month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { $gte: start };
    case "last-6-months":
      start.setMonth(start.getMonth() - 6);
      return { $gte: start };
    case "last-year":
      start.setFullYear(start.getFullYear() - 1);
      return { $gte: start };
    default:
      return null;
  }
}

// DASHBOARD overview (must be above /:id route)
router.get("/dashboard/overview", async (req, res) => {
  try {
    const [
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      deptData,
      recent,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: statusRegex("Pending") }),
      Complaint.countDocuments({ status: statusRegex("In Progress") }),
      Complaint.countDocuments({ status: statusRegex("Resolved") }),
      Complaint.countDocuments({ status: statusRegex("Rejected") }),
      Complaint.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$department", "Unassigned"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("title department status assignedTo createdAt"),
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      deptData,
      recent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all complaints with optional filters
router.get("/", async (req, res) => {
  try {
    const { status, department, search, time } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = statusRegex(status);
    }

    if (department && department !== "all") {
      query.department = department;
    }

    const dateFilter = buildDateFilter(time);
    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { department: regex },
        { assignedTo: regex },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single complaint by ID
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ASSIGN complaint
router.put("/:id/assign", async (req, res) => {
  try {
    const officer = req.body.officer?.trim();
    if (!officer) {
      return res.status(400).json({ message: "Officer name is required" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.assignedTo = officer;
    if (complaint.status === "Pending" || complaint.status === "Rejected") {
      complaint.status = "In Progress";
    }

    await complaint.save();
    res.json({ message: "Assigned successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE complaint status
router.put("/:id/status", async (req, res) => {
  try {
    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    const status = req.body.status;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    if (status === "Rejected") {
      complaint.assignedTo = null;
    }

    await complaint.save();
    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REJECT complaint
router.put("/:id/reject", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "Rejected";
    complaint.assignedTo = null;

    await complaint.save();
    res.json({ message: "Rejected successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

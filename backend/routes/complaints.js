// routes/complaints.js
const express      = require("express");
const multer       = require("multer");
const path         = require("path");
const nodemailer   = require("nodemailer");
const Complaint    = require("../models/Complaint");
const User         = require("../models/User");
const Department   = require("../models/Department");
const Officer      = require("../models/Officer");

const router = express.Router();

// ─────────────────────────────────────────────
// Multer — save files to /uploads as-is
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ─────────────────────────────────────────────
// Nodemailer transporter
// Uses SMTP credentials from .env
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// Email template — nice HTML format
// ─────────────────────────────────────────────
function buildConfirmationEmail(citizen, complaint) {
  const submittedAt = new Date(complaint.createdAt).toLocaleString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const severityColor = {
    low:      "#16a34a",
    medium:   "#d97706",
    high:     "#dc2626",
    critical: "#7c3aed",
  }[complaint.severity] || "#d97706";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Complaint Confirmation – CityFix</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-block;line-height:36px;font-size:18px;">📍</div>
              <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">City<span style="color:#93c5fd;">Fix</span></span>
            </div>
            <p style="color:#bfdbfe;margin:12px 0 0;font-size:14px;">Complaint Management System</p>
          </td>
        </tr>

        <!-- Success Banner -->
        <tr>
          <td style="background:#f0fdf4;border-bottom:2px solid #bbf7d0;padding:20px 40px;text-align:center;">
            <span style="font-size:32px;">✅</span>
            <h2 style="margin:8px 0 4px;color:#15803d;font-size:20px;font-weight:700;">Complaint Submitted Successfully!</h2>
            <p style="margin:0;color:#166534;font-size:14px;">We have received your complaint and will act on it promptly.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="margin:0 0 24px;color:#374151;font-size:15px;">
              Dear <strong>${citizen.name}</strong>,<br/>
              Thank you for reaching out to CityFix. Here are the details of your submitted complaint:
            </p>

            <!-- Complaint ID Badge -->
            <div style="background:#eff6ff;border:1.5px dashed #3b82f6;border-radius:10px;padding:16px 24px;margin-bottom:28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Your Complaint ID</p>
              <p style="margin:0;font-size:28px;font-weight:800;color:#1d4ed8;letter-spacing:2px;">${complaint.complaintId}</p>
              <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">Save this ID to track your complaint status</p>
            </div>

            <!-- Details Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">
              <tr>
                <td style="padding:12px 16px;background:#f9fafb;border-radius:8px 8px 0 0;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">📋 Title</span><br/>
                  <span style="font-size:15px;color:#111827;font-weight:600;margin-top:4px;display:block;">${complaint.title}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#ffffff;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">🏢 Department</span><br/>
                  <span style="font-size:15px;color:#111827;margin-top:4px;display:block;">${complaint.department}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">⚠️ Severity</span><br/>
                  <span style="display:inline-block;margin-top:6px;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:700;color:#ffffff;background:${severityColor};">
                    ${complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#ffffff;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">📍 Location</span><br/>
                  <span style="font-size:15px;color:#111827;margin-top:4px;display:block;">${complaint.location?.address || "—"}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#f9fafb;border-radius:0 0 8px 8px;">
                  <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">🕐 Submitted At</span><br/>
                  <span style="font-size:15px;color:#111827;margin-top:4px;display:block;">${submittedAt}</span>
                </td>
              </tr>
            </table>

            <!-- Description -->
            <div style="background:#fafafa;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">📝 Description</p>
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">${complaint.description}</p>
            </div>

            <!-- What happens next -->
            <div style="background:#fefce8;border:1.5px solid #fde68a;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#92400e;">⏭️ What happens next?</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;vertical-align:top;">
                    <span style="color:#d97706;font-size:16px;margin-right:10px;">1.</span>
                  </td>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;color:#78350f;">Our team will review your complaint within <strong>24 hours</strong>.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;vertical-align:top;">
                    <span style="color:#d97706;font-size:16px;margin-right:10px;">2.</span>
                  </td>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;color:#78350f;">An officer from the <strong>${complaint.department}</strong> department will be assigned.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;vertical-align:top;">
                    <span style="color:#d97706;font-size:16px;margin-right:10px;">3.</span>
                  </td>
                  <td style="padding:5px 0;">
                    <span style="font-size:13px;color:#78350f;">You will be notified at each stage of resolution.</span>
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin:0;font-size:14px;color:#6b7280;text-align:center;">
              Use complaint ID <strong style="color:#1d4ed8;">${complaint.complaintId}</strong> to track your complaint anytime on the CityFix portal.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;">This is an automated email from CityFix. Please do not reply.</p>
            <p style="margin:0;font-size:12px;color:#d1d5db;">© ${new Date().getFullYear()} CityFix – Making Cities Better</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────
// POST /api/create  —  Submit a complaint
// ─────────────────────────────────────────────
router.post("/create", upload.single("evidence"), async (req, res) => {
  try {
    const { title, description, location, department, severity, citizenId } = req.body;

    if (!title || !description || !location || !department) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (!citizenId) {
      return res.status(400).json({ message: "User not logged in. Please log in and try again." });
    }

    // Create and save complaint
    const complaint = new Complaint({
      title,
      description,
      department,
      severity:  severity || "medium",
      citizenId: citizenId,
      location: {
        address: location,
        lat: req.body.lat ? parseFloat(req.body.lat) : undefined,
        lng: req.body.lng ? parseFloat(req.body.lng) : undefined,
      },
      evidencePaths: req.file ? [req.file.filename] : [],
      status: "pending",
    });

    await complaint.save();

    await Department.findOneAndUpdate(
      { name: department },
      { $inc: { totalComplaints: 1, pendingComplaints: 1 } }
    );

    // ── Send confirmation email ──
    try {
      const citizen = await User.findById(citizenId);
      if (citizen && citizen.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from:    `"CityFix" <${process.env.EMAIL_USER}>`,
          to:      citizen.email,
          subject: `✅ Complaint Submitted – ${complaint.complaintId} | CityFix`,
          html:    buildConfirmationEmail(citizen, complaint),
        });
        console.log(`Confirmation email sent to ${citizen.email}`);
      }
    } catch (emailErr) {
      // Email failure should NOT fail the whole request
      console.error("Email send failed (non-fatal):", emailErr.message);
    }

    return res.status(201).json({
      message:     "Complaint submitted successfully",
      complaintId: complaint.complaintId,
      _id:         complaint._id,
      complaint,
    });

  } catch (err) {
    console.error("Error creating complaint:", err);
    return res.status(500).json({ message: "Error creating complaint", error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/mycomplaints?userId=<id>
// ─────────────────────────────────────────────
router.get("/mycomplaints", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    const complaints = await Complaint
      .find({ citizenId: userId })
      .populate("officerId", "name designation departmentName")
      .sort({ createdAt: -1 });

    return res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({ message: "Error fetching complaints", error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/complaint/:id  — by complaintId or _id
// ─────────────────────────────────────────────
router.get("/complaint/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let complaint = await Complaint
      .findOne({ complaintId: id.toUpperCase() })
      .populate("officerId", "name designation departmentName");
    if (!complaint) {
      complaint = await Complaint
        .findById(id)
        .populate("officerId", "name designation departmentName")
        .catch(() => null);
    }

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json(complaint);
  } catch (err) {
    console.error("Error fetching complaint:", err);
    return res.status(500).json({ message: "Error fetching complaint", error: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/complaint/:id/assign  —  Admin assigns officer
// ─────────────────────────────────────────────
router.patch("/complaint/:id/assign", async (req, res) => {
  try {
    const { officerId } = req.body;

    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status:     "assigned",
        officerId:  officer._id,
        assignedAt: new Date(),
      },
      { new: true }
    ).populate("officerId", "name designation departmentName");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Update department stats
    await Department.findOneAndUpdate(
      { name: complaint.department },
      { $inc: { pendingComplaints: -1 } }
    );

    // Update officer case count
    await Officer.findByIdAndUpdate(officer._id, { $inc: { casesHandled: 1 } });

    res.json({ message: "Officer assigned successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/complaint/:id/status  —  Officer updates status
// ─────────────────────────────────────────────
router.patch("/complaint/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const update = { status };
    if (status === "resolved") update.resolvedAt = new Date();

    await Complaint.findByIdAndUpdate(req.params.id, update);

    if (status === "resolved") {
      await Department.findOneAndUpdate(
        { name: complaint.department },
        { $inc: { resolvedComplaints: 1, pendingComplaints: -1 } }
      );
      if (complaint.officerId) {
        await Officer.findByIdAndUpdate(
          complaint.officerId,
          { $inc: { casesResolved: 1 } }
        );
      }
    }

    if (status === "rejected") {
      await Department.findOneAndUpdate(
        { name: complaint.department },
        { $inc: { pendingComplaints: -1 } }
      );
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/complaint/:id/withdraw  —  Citizen withdraws complaint
// ─────────────────────────────────────────────
router.patch("/complaint/:id/withdraw", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await Department.findOneAndUpdate(
      { name: complaint.department },
      { $inc: { pendingComplaints: -1 } }
    );

    res.json({ message: "Complaint withdrawn" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
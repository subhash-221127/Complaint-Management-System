const mongoose = require("mongoose");

const COMPLAINT_STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    citizenName: { type: String, trim: true },
    citizenPhone: { type: String, trim: true },
    citizenEmail: { type: String, trim: true, lowercase: true },
    department: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "Pending",
    },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    date: { type: Date, default: Date.now },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    locationPin: {
      x: { type: Number },
      y: { type: Number },
    },
  },
  { timestamps: true }
);

complaintSchema.pre("save", async function preSave(next) {
  if (this.complaintId) return next();
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;
  const count = await mongoose
    .model("Complaint")
    .countDocuments({ complaintId: new RegExp(`^${prefix}`) });
  const nextNumber = String(count + 1).padStart(3, "0");
  this.complaintId = `${prefix}${nextNumber}`;
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);

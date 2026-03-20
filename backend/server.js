// ===========================
// IMPORTS
// ===========================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ===========================
// DB CONNECTION
// ===========================
const MONGO_URI = "mongodb://n220648_db_user:cityfix123@ac-r96cwdz-shard-00-00.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-01.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-02.guu2ckh.mongodb.net:27017/complaint-management-system?ssl=true&replicaSet=atlas-10t6yk-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ===========================
// MODELS
// ===========================
const User = require('./models/User');
const Department = require('./models/Department');
const Officer = require('./models/Officer');
const Complaint = require('./models/Complaint');

// ===========================
// FILE UPLOAD
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===========================
// AUTH
// ===========================

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already exists' });

    const user = new User({ name, email, password, role });
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

// Serve static frontend if needed
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve uploaded evidence files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// Routes
// ---------------------------
const userRoutes = require("./routes/auth"); // your login/signup routes
app.use("/api", userRoutes);

// Complaints
const complaintsRoutes = require("./routes/complaints");
app.use("/api", complaintsRoutes);

// Officers
const officerRoutes = require("./routes/officers");
app.use("/api", officerRoutes);

// Admin
const adminRoutes = require("./routes/admin");
app.use("/api", adminRoutes);

// ---------------------------
// MongoDB Connection
// ---------------------------
const MONGO_URI = process.env.MONGO_URI;

function connectToMongo(uri) {
  return mongoose.connect(uri)
    .then(() => console.log(`MongoDB connected (${uri})`))
    .catch(err => {
      console.error(`MongoDB connection error (${uri}):`, err);
      throw err;
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile
app.get('/api/me/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================
// DEPARTMENTS
// ===========================

// GET all
app.get('/api/departments', async (req, res) => {
  const data = await Department.find();
  res.json(data);
});

// ADD
app.post('/api/departments', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ error: 'Name required' });

    const exists = await Department.findOne({ name });
    if (exists)
      return res.status(400).json({ error: 'Already exists' });

    const dept = new Department({ name });
    await dept.save();

    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE
app.delete('/api/departments/:id', async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ===========================
// DEPARTMENT STATS (🔥 FIXED)
// ===========================
app.get('/api/departments/:id/stats', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept)
      return res.status(404).json({ error: 'Not found' });

    const filter = {
      $or: [
        { department: dept._id },
        { department: dept._id.toString() }
      ]
    };

    const complaints = await Complaint.find(filter);

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const progress = complaints.filter(c => c.status === 'In Progress').length;

    const officers = await Officer.find({
      $or: [
        { department: dept._id },
        { department: dept._id.toString() }
      ]
    });

    res.json({
      department: dept,
      stats: {
        totalComplaints: total,
        resolvedComplaints: resolved,
        pendingComplaints: pending,
        inProgressComplaints: progress,
        totalOfficers: officers.length,
        activeOfficers: officers.filter(o => o.active).length
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================
// COMPLAINTS (🔥 FIXED)
// ===========================

// CREATE
app.post('/api/complaints', upload.single('evidence'), async (req, res) => {
  try {
    const { title, description, department, citizen, priority } = req.body;

    const complaint = new Complaint({
      title,
      description,
      department, // MUST BE ID
      citizen,
      priority,
      evidence: req.file ? req.file.path : null
    });

    await complaint.save();
    res.json(complaint);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET
app.get('/api/complaints', async (req, res) => {
  try {
    let filter = {};

    if (req.query.department) {
      filter = {
        $or: [
          { department: req.query.department },
          { department: new mongoose.Types.ObjectId(req.query.department) }
        ]
      };
    }

    const data = await Complaint.find(filter)
      .populate('department')
      .populate('citizen')
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================
// OFFICERS
// ===========================
app.get('/api/officers', async (req, res) => {
  try {
    let filter = {};

    if (req.query.department) {
      filter = {
        $or: [
          { department: req.query.department },
          { department: new mongoose.Types.ObjectId(req.query.department) }
        ]
      };
    }

    const data = await Officer.find(filter).populate('department');

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================
// OFFICER REQUEST COUNT
// ===========================
app.get('/api/officer-requests/count', async (req, res) => {
  const count = await User.countDocuments({ role: 'officer', approved: false });
  res.json({ count });
});

// ===========================
// SERVER START
// ===========================
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
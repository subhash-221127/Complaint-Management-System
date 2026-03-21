const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
<<<<<<< HEAD
<<<<<<< HEAD

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ROUTES (ALL HERE ONLY ONCE)
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const complaintsRoutes = require("./routes/complaints");

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", complaintsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected (Atlas)");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// ✅ ERROR HANDLER (ALWAYS LAST)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
=======
=======
>>>>>>> 0b02f2ad843c285d0c8d1cd84620fbc0c70d05bb
const path = require("path");

dotenv.config();
const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

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

// Departments
const departmentRoutes = require("./routes/departments");
app.use("/api", departmentRoutes);

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
    });
}

connectToMongo(MONGO_URI)
  .catch(async () => {
    // If the primary URI fails, try localhost as a fallback (useful for offline development).
    const fallback = "mongodb://127.0.0.1:27017/complaint-management-system";
    if (MONGO_URI !== fallback) {
      console.log("Attempting fallback MongoDB URI (local) …");
      try {
        await connectToMongo(fallback);
      } catch (err) {
        console.error("Fallback MongoDB connection also failed. The server will start but database features may not work.");
      }
    }
  });

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> 0b02f2ad843c285d0c8d1cd84620fbc0c70d05bb

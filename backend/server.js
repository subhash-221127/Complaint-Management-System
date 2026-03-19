const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

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
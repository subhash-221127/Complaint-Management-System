// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Serve any HTML file from frontend folder
app.get("/:folder/:file", (req, res) => {
  const folder = req.params.folder;
  const file = req.params.file;

  const filePath = path.join(frontendPath, folder, file);
  res.sendFile(filePath, err => {
    if (err) res.status(404).send("File not found");
  });
});

// Optional: catch root requests (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
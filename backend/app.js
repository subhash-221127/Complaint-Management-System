const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const apiRoutes = require("./routes");

dotenv.config();

const app = express();

const PORT = 5000;

const MONGODB_URI =
"mongodb://n220648_db_user:GuTTZK8EVofm8pEx@ac-r96cwdz-shard-00-00.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-01.guu2ckh.mongodb.net:27017,ac-r96cwdz-shard-00-02.guu2ckh.mongodb.net:27017/?ssl=true&replicaSet=atlas-10t6yk-shard-0&authSource=admin&appName=Cluster0";


app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.send("Complaint Management System API is running");
});

app.use("/api", apiRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
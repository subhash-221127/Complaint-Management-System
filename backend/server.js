const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const complaintRoutes = require("./routes/complaints");
const authRoutes = require("./routes/auth");
app.use("/api/complaints", complaintRoutes);
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.MONGO_DB_NAME || "complaint-management-system";
const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_DIRECT = process.env.MONGO_URI_DIRECT;
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL;
const START_WITHOUT_DB = process.env.START_WITHOUT_DB === "true";

function printMongoHelp(error, uri) {
  console.error("MongoDB connection error:", error.message || error);

  if (!uri) {
    console.error("MONGO_URI is missing in backend/.env");
    return;
  }

  const isSrvUri = uri.startsWith("mongodb+srv://");
  if (isSrvUri && (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND")) {
    console.error("\nDetected DNS/SRV resolution issue for Atlas.");
    console.error("Check these quickly:");
    console.error("1) Atlas cluster is running (not paused)");
    console.error("2) Atlas Network Access includes your current IP");
    console.error("3) Local DNS/network can resolve Atlas host (try: nslookup <cluster-host>)");
    console.error("4) Credentials are URL-encoded if password has special chars");
  }
}

async function connectMongoWithRetry(uri, attempts = 3) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await mongoose.connect(uri, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 10000,
      });
      return;
    } catch (error) {
      if (i === attempts) {
        throw error;
      }

      console.warn(`Mongo connect attempt ${i} failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * i));
    }
  }
}

async function connectUsingCandidates() {
  const candidates = [
    { name: "MONGO_URI", value: MONGO_URI },
    { name: "MONGO_URI_DIRECT", value: MONGO_URI_DIRECT },
    { name: "MONGO_URI_LOCAL", value: MONGO_URI_LOCAL },
  ].filter((entry) => Boolean(entry.value));

  if (candidates.length === 0) {
    throw new Error(
      "No Mongo URI configured. Set MONGO_URI or MONGO_URI_DIRECT or MONGO_URI_LOCAL in .env"
    );
  }

  let lastError;

  for (const candidate of candidates) {
    try {
      console.log(`Trying Mongo connection via ${candidate.name}...`);
      await connectMongoWithRetry(candidate.value);
      return candidate.name;
    } catch (error) {
      lastError = error;
      console.warn(`Connection failed via ${candidate.name}: ${error.message}`);
    }
  }

  throw lastError;
}

async function startServer() {
  try {
    const connectedWith = await connectUsingCandidates();
    console.log(`MongoDB connected to database: ${DB_NAME} (${connectedWith})`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    printMongoHelp(error, MONGO_URI || MONGO_URI_DIRECT || MONGO_URI_LOCAL);

    if (START_WITHOUT_DB) {
      console.warn("START_WITHOUT_DB=true: starting API without MongoDB connection.");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (without DB)`);
      });
      return;
    }

    process.exit(1);
  }
}

startServer();

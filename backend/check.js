const mongoose = require("mongoose");
require("dotenv").config(); // load .env

const Complaint = require("./models/complaints");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    const count = await Complaint.countDocuments();
    console.log(`Total complaints in database: ${count}`);
    const complaints = await Complaint.find();
    console.log(complaints);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
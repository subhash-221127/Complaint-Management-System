const express = require("express");
const User = require("../models/Admin_page_User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).sort({ name: 1 });
    res.json({ success: true, data: citizens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const citizen = await User.findOne({ _id: req.params.id, role: "citizen" });
    if (!citizen) return res.status(404).json({ success: false, message: "Citizen not found" });
    res.json({ success: true, data: citizen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;

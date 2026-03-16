const express = require("express");
const router = express.Router();
const Officer = require("../models/Officer");

router.get("/", async (req, res) => {
  try {
    const officers = await Officer.find();
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
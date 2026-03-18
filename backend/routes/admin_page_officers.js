const express = require("express");
const router = express.Router();
const Officer = require("../models/Admin_page_Officer");

router.get("/", async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.department) {
      query.department = req.query.department;
    }

    const officers = await Officer.find(query).sort({ name: 1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;

const express = require("express");

const complaints = require("./complaints");
const citizens = require("./citizens");
const officers = require("./officers");

const router = express.Router();

router.use("/complaints", complaints);
router.use("/citizens", citizens);
router.use("/officers", officers);

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

module.exports = router;
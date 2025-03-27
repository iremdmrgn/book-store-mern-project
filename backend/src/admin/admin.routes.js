const express = require("express");
const { getLastSeenOrderCount, updateLastSeenOrderCount } = require("./admin.controller");
const router = express.Router();

// Bu rotaların admin auth middleware ile korunması önerilir
router.get("/:adminId/last-seen", getLastSeenOrderCount);
router.put("/:adminId/last-seen", updateLastSeenOrderCount);

module.exports = router;

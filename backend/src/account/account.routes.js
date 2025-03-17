// src/account/account.routes.js
const express = require("express");
const router = express.Router();
const { syncAccount, updateAccount } = require("./account.controller");

// POST /api/account/sync — for syncing a Firebase user to MongoDB
router.post("/sync", syncAccount);

// PUT /api/account/:id — for updating an existing account
router.put("/:id", updateAccount);

module.exports = router;

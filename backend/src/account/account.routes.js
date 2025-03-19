const express = require("express");
const router = express.Router();
const { getAccount, syncAccount, updateAccount } = require("./account.controller");

// GET /api/account/:uid — fetch a single account from MongoDB
router.get("/:uid", getAccount);

// POST /api/account/sync — sync a Firebase user to MongoDB
router.post("/sync", syncAccount);

// PUT /api/account/:uid — update an existing account using the Firebase UID
router.put("/:uid", updateAccount);

module.exports = router;

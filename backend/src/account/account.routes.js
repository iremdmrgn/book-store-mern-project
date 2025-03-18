const express = require("express");
const router = express.Router();
const { syncAccount, updateAccount } = require("./account.controller");

// POST /api/account/sync — for syncing a Firebase user to MongoDB
router.post("/sync", syncAccount);

// PUT /api/account/:uid — for updating an existing account using the Firebase UID
router.put("/:uid", updateAccount);

module.exports = router;

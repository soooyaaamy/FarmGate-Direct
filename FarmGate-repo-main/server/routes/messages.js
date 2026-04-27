const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/messagecontroller");

// GET messages for a user
router.get("/:userId", getMessages);

// POST a new message
router.post("/", sendMessage);

module.exports = router;
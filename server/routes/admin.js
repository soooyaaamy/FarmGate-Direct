const express = require("express");
const router = express.Router();
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getStats,
} = require("../controllers/admincontroller");

// Pending users
router.get("/pending", getPendingUsers);

// Approve a user
router.put("/approve/:id", approveUser);

// Reject a user
router.put("/reject/:id", rejectUser);

// Admin stats
router.get("/stats", getStats);

module.exports = router;
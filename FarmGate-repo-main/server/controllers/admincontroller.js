  const path = require("path");
  const { readJSON, writeJSON } = require("../utils/filehelper");

const USERS_FILE = path.join(__dirname, "../data/users.json");

// Get all pending users
const getPendingUsers = (req, res) => {
  const users = readJSON(USERS_FILE);
  const pendingUsers = users.filter((u) => u.status?.toLowerCase() === "pending");
  res.json(pendingUsers);
};

// Approve a user
const approveUser = (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "approved";
  writeJSON(USERS_FILE, users);
  res.json({ message: "User approved" });
};

// Reject a user
const rejectUser = (req, res) => {
  let users = readJSON(USERS_FILE);
  const originalLength = users.length;
  users = users.filter((u) => u.id !== req.params.id);
  if (users.length === originalLength)
    return res.status(404).json({ message: "User not found" });

  writeJSON(USERS_FILE, users);
  res.json({ message: "User rejected" });
};

// Admin stats
const getStats = (req, res) => {
  const users = readJSON(USERS_FILE);
  const approvedUsers = users.filter((u) => u.status === "approved");
  const farmerCount = approvedUsers.filter((u) => u.role === "farmer").length;
  const buyerCount = approvedUsers.filter((u) => u.role === "buyer").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;

  res.json({
    totalUsers: { farmer: farmerCount, buyer: buyerCount },
    total: farmerCount + buyerCount,
    pending: pendingCount,
  });
};

module.exports = { getPendingUsers, approveUser, rejectUser, getStats };
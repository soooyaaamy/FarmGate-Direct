const path = require("path");
const { readJSON } = require("../utils/filehelper");

const USERS_FILE = path.join(__dirname, "../data/users.json");

const getUserById = (req, res) => {
  try {
    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = { getUserById };

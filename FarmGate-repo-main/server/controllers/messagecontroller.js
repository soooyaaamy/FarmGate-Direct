const path = require("path");
const { readJSON, writeJSON } = require("../utils/filehelper");

const MESSAGES_FILE = path.join(__dirname, "../data/messages.json");

// Get messages for a user
const getMessages = (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  const userMessages = messages.filter(
    (m) => m.senderId === req.params.userId || m.receiverId === req.params.userId
  );
  res.json(userMessages);
};

// Send a new message
const sendMessage = (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  const newMessage = { id: Date.now().toString(), timestamp: new Date(), ...req.body };
  messages.push(newMessage);
  writeJSON(MESSAGES_FILE, messages);
  res.json(newMessage);
};

module.exports = { getMessages, sendMessage };
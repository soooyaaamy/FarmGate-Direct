const path = require("path");
const { readJSON, writeJSON } = require("../utils/filehelper");

const USERS_FILE = path.join(__dirname, "../data/users.json");

const register = (req, res) => {
  const users = readJSON(USERS_FILE);
  const {
    fullName,
    email,
    phone,
    password,
    role,
    farmName,
    barangay,
    municipality,
    province,
    farmPhoto,
    productPhoto,
    validID,
    farmerCert,
    rsbaCert,
    photo,
  } = req.body;

  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "Email already exists" });

  const newUser = {
    id: Date.now().toString(),
    fullName,
    email,
    phone,
    password,
    role: role?.toLowerCase(),
    status: "pending",
    submitted: new Date().toLocaleDateString(),
    farmName: farmName || null,
    barangay: barangay || null,
    municipality: municipality || null,
    province: province || null,
    farmPhoto: farmPhoto || null,
    productPhoto: productPhoto || null,
    validID: validID || null,
    farmerCert: farmerCert || null,
    rsbaCert: rsbaCert || null,
    photo: photo || null,
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);
  res.json({ message: "Registration submitted. Wait for approval." });
};

const login = (req, res) => {
  const users = readJSON(USERS_FILE);
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  if (user.status?.toLowerCase() !== "approved")
    return res.status(403).json({ message: "Account not approved yet" });

  res.json({
    message: "Login successful",
    role: user.role,
    userId: user.id,
    fullName: user.fullName,
    farmName: user.farmName,
  });
};

module.exports = { register, login };
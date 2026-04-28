const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const messageRoutes = require("./routes/messages");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
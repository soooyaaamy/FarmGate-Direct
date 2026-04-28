const path = require("path");
const { readJSON, writeJSON } = require("../utils/filehelper");

const ORDERS_FILE = path.join(__dirname, "../data/orders.json");
const CART_FILE = path.join(__dirname, "../data/cart.json");

const checkout = (req, res) => {
  const { buyerId } = req.params;
  const { items, delivery, payment, buyerName } = req.body;

  if (!buyerId || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Invalid checkout data" });
  }

  const orders = readJSON(ORDERS_FILE) || [];
  const cart = readJSON(CART_FILE) || [];

  const newOrders = [];

  // CREATE ORDERS
  items.forEach(farm => {
    farm.products.forEach(product => {

      const order = {
        id: "ORD-" + Date.now() + Math.floor(Math.random() * 1000),
        buyerId,
        buyerName,
        farmerId: farm.farmerId,
        farmName: farm.farmName,
        productId: product.id,
        productName: product.name,
        price: parseFloat(product.price),
        quantity: product.quantity,
        total: parseFloat(product.price) * product.quantity,
        delivery: delivery || "pickup",
        payment: payment || "cod",
        status: "Pending",
        date: new Date().toISOString()
      };

      newOrders.push(order);
    });
  });

  orders.push(...newOrders);

  // REMOVE ITEMS FROM CART
  const buyerCart = cart.find(c => String(c.buyerId) === String(buyerId));

  if (buyerCart) {

    items.forEach(farm => {

      const farmer = buyerCart.farmers.find(
        f => String(f.farmerId) === String(farm.farmerId)
      );

      if (farmer) {

        farm.products.forEach(product => {

          farmer.products = farmer.products.filter(
            p => String(p.id) !== String(product.id)
          );

        });

      }

    });

    // remove empty farmers
    buyerCart.farmers = buyerCart.farmers.filter(
      f => f.products.length > 0
    );

    // remove buyer cart if empty
    if (buyerCart.farmers.length === 0) {

      const index = cart.findIndex(
        c => String(c.buyerId) === String(buyerId)
      );

      if (index !== -1) cart.splice(index, 1);
    }

  }

  writeJSON(ORDERS_FILE, orders);
  writeJSON(CART_FILE, cart);

  res.status(201).json({
    message: "Checkout successful",
    orders: newOrders
  });
};
const getFarmerOrders = (req, res) => {
  const { farmerId } = req.params;
  if (!farmerId) return res.status(400).json({ message: "farmerId required" });

  const orders = readJSON(ORDERS_FILE) || [];
  const farmerOrders = orders.filter(o => String(o.farmerId) === String(farmerId));
  res.json(farmerOrders);
};

// Get specific order detail
const getOrderById = (req, res) => {
  const { orderId } = req.params;
  const orders = readJSON(ORDERS_FILE) || [];
  const order = orders.find(o => String(o.id) === String(orderId));

  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

// Update order status
const updateOrderStatus = (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const orders = readJSON(ORDERS_FILE) || [];
  const order = orders.find(o => String(o.id) === String(orderId));

  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status || order.status;
  writeJSON(ORDERS_FILE, orders);

  res.json({ message: "Order status updated", order });
}

module.exports = { checkout, getFarmerOrders, getOrderById, updateOrderStatus };


// const path = require("path");
// const { readJSON, writeJSON } = require("../utils/filehelper");

// const CART_FILE = path.join(__dirname, "../data/cart.json");

// // Get cart for specific buyer
// const getCart = (req, res) => {
//   const { buyerId } = req.params; // frontend passes buyerId in URL
//   if (!buyerId) return res.status(400).json({ message: "buyerId required" });

//   const cart = readJSON(CART_FILE) || [];
//   // convert both sides to string to avoid number/string mismatch
//   const buyerCart = cart.filter(c => String(c.buyerId) === String(buyerId));

//   res.json(buyerCart);
// };

// // Add item to cart
// const addToCart = (req, res) => {
//   const { buyerId, buyerName, farmName, id, name, price, image, quantity } = req.body;
//   if (!buyerId || !buyerName) return res.status(400).json({ message: "buyerId and buyerName required" });
//   if (!farmName) return res.status(400).json({ message: "farmName required" });

//   const cart = readJSON(CART_FILE) || [];

//   let buyerCart = cart.find(c => String(c.buyerId) === String(buyerId));
//   if (!buyerCart) {
//     buyerCart = { buyerId, buyerName, farmers: [] };
//     cart.push(buyerCart);
//   }

//   let farmer = buyerCart.farmers.find(f => f.farmName === farmName);
//   if (!farmer) {
//     farmer = { farmName, products: [] };
//     buyerCart.farmers.push(farmer);
//   }

//   let product = farmer.products.find(p => String(p.id) === String(id));
//   if (product) product.quantity += quantity || 1;
//   else farmer.products.push({ id, name, price, image, quantity: quantity || 1 });

//   writeJSON(CART_FILE, cart);
//   res.json(buyerCart);
// };

// // Update product quantity
// const updateQty = (req, res) => {
//   const { buyerId, farmName, productId } = req.params;
//   const { quantity } = req.body;

//   if (!buyerId) return res.status(400).json({ message: "buyerId required" });

//   const cart = readJSON(CART_FILE) || [];
//   const buyerCart = cart.find(c => String(c.buyerId) === String(buyerId));
//   if (!buyerCart) return res.status(404).json({ message: "Cart not found" });

//   const farmer = buyerCart.farmers.find(f => f.farmName === farmName);
//   if (!farmer) return res.status(404).json({ message: "Farmer not found" });

//   const product = farmer.products.find(p => String(p.id) === String(productId));
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   product.quantity = quantity;
//   writeJSON(CART_FILE, cart);
//   res.json(product);
// };

// // Remove item
// const removeItem = (req, res) => {
//   const { buyerId, farmName, productId } = req.params;
//   if (!buyerId) return res.status(400).json({ message: "buyerId required" });

//   const cart = readJSON(CART_FILE) || [];
//   const buyerCart = cart.find(c => String(c.buyerId) === String(buyerId));
//   if (!buyerCart) return res.status(404).json({ message: "Cart not found" });

//   const farmer = buyerCart.farmers.find(f => f.farmName === farmName);
//   if (!farmer) return res.status(404).json({ message: "Farmer not found" });

//   farmer.products = farmer.products.filter(p => String(p.id) !== String(productId));
//   buyerCart.farmers = buyerCart.farmers.filter(f => f.products.length > 0);

//   const updatedCart = cart.filter(c => c.farmers.length > 0);
//   writeJSON(CART_FILE, updatedCart);
//   res.json({ message: "Product removed", cart: buyerCart });
// };

// // Clear entire cart
// const clearCart = (req, res) => {
//   const { buyerId } = req.params;
//   if (!buyerId) return res.status(400).json({ message: "buyerId required" });

//   const cart = readJSON(CART_FILE) || [];
//   const updatedCart = cart.filter(c => String(c.buyerId) !== String(buyerId));
//   writeJSON(CART_FILE, updatedCart);
//   res.json({ message: "Cart cleared" });
// };

// module.exports = { getCart, addToCart, updateQty, removeItem, clearCart };

// const path = require("path");
// const { readJSON, writeJSON } = require("../utils/filehelper");

// const CART_FILE = path.join(__dirname, "../data/cart.json");

// /* ======================
//    GET CART
// ====================== */

// const getCart = (req, res) => {
//   const { buyerId } = req.params;

//   const cart = readJSON(CART_FILE) || [];

//   const buyerCart = cart.filter(
//     c => String(c.buyerId) === String(buyerId)
//   );

//   res.json(buyerCart);
// };


// /* ======================
//    ADD TO CART
// ====================== */

// const addToCart = (req, res) => {
//   const {
//     buyerId,
//     buyerName,
//     farmerId,
//     farmName,
//     id,
//     name,
//     price,
//     image,
//     quantity
//   } = req.body;

//   if (!buyerId || !buyerName)
//     return res.status(400).json({ message: "buyerId and buyerName required" });

//   if (!farmerId)
//     return res.status(400).json({ message: "farmerId required" });

//   const cart = readJSON(CART_FILE) || [];

//   let buyerCart = cart.find(
//     c => String(c.buyerId) === String(buyerId)
//   );

//   if (!buyerCart) {
//     buyerCart = {
//       buyerId,
//       buyerName,
//       farmers: []
//     };
//     cart.push(buyerCart);
//   }

//   let farmer = buyerCart.farmers.find(
//     f => String(f.farmerId) === String(farmerId)
//   );

//   if (!farmer) {
//     farmer = {
//       farmerId,
//       farmName,
//       products: []
//     };
//     buyerCart.farmers.push(farmer);
//   }

//   let product = farmer.products.find(
//     p => String(p.id) === String(id)
//   );

//   if (product) {
//     product.quantity += quantity || 1;
//   } else {
//     farmer.products.push({
//       id,
//       name,
//       price,
//       image,
//       quantity: quantity || 1
//     });
//   }

//   writeJSON(CART_FILE, cart);

//   res.json(buyerCart);
// };


// /* ======================
//    UPDATE QUANTITY
// ====================== */

// const updateQty = (req, res) => {

//   const { buyerId, farmerId, productId } = req.params;
//   const { quantity } = req.body;

//   const cart = readJSON(CART_FILE) || [];

//   const buyerCart = cart.find(
//     c => String(c.buyerId) === String(buyerId)
//   );

//   if (!buyerCart)
//     return res.status(404).json({ message: "Cart not found" });

//   const farmer = buyerCart.farmers.find(
//     f => String(f.farmerId) === String(farmerId)
//   );

//   if (!farmer)
//     return res.status(404).json({ message: "Farmer not found" });

//   const product = farmer.products.find(
//     p => String(p.id) === String(productId)
//   );

//   if (!product)
//     return res.status(404).json({ message: "Product not found" });

//   product.quantity = quantity;

//   writeJSON(CART_FILE, cart);

//   res.json(product);
// };


// /* ======================
//    REMOVE ITEM
// ====================== */

// const removeItem = (req, res) => {

//   const { buyerId, farmerId, productId } = req.params;

//   const cart = readJSON(CART_FILE) || [];

//   const buyerCart = cart.find(
//     c => String(c.buyerId) === String(buyerId)
//   );

//   if (!buyerCart)
//     return res.status(404).json({ message: "Cart not found" });

//   const farmer = buyerCart.farmers.find(
//     f => String(f.farmerId) === String(farmerId)
//   );

//   if (!farmer)
//     return res.status(404).json({ message: "Farmer not found" });

//   farmer.products = farmer.products.filter(
//     p => String(p.id) !== String(productId)
//   );

//   buyerCart.farmers = buyerCart.farmers.filter(
//     f => f.products.length > 0
//   );

//   const updatedCart = cart.filter(
//     c => c.farmers.length > 0
//   );

//   writeJSON(CART_FILE, updatedCart);

//   res.json({ message: "Product removed" });
// };


// /* ======================
//    CLEAR CART
// ====================== */

// const clearCart = (req, res) => {

//   const { buyerId } = req.params;

//   const cart = readJSON(CART_FILE) || [];

//   const updatedCart = cart.filter(
//     c => String(c.buyerId) !== String(buyerId)
//   );

//   writeJSON(CART_FILE, updatedCart);

//   res.json({ message: "Cart cleared" });
// };

// module.exports = {
//   getCart,
//   addToCart,
//   updateQty,
//   removeItem,
//   clearCart
// };

const path = require("path");
const { readJSON, writeJSON } = require("../utils/filehelper");

const CART_FILE = path.join(__dirname, "../data/cart.json");

// Get cart
const getCart = (req, res) => {
  const { buyerId } = req.params;

  if (!buyerId) {
    return res.status(400).json({ message: "buyerId required" });
  }

  const cart = readJSON(CART_FILE) || [];

  const buyerCart = cart.find(
    (c) => String(c.buyerId) === String(buyerId)
  );

  res.json(buyerCart || { buyerId, farmers: [] });
};

// Add to cart
const addToCart = (req, res) => {
  const {
    buyerId,
    buyerName,
    farmerId,
    farmName,
    id,
    name,
    price,
    image,
    quantity
  } = req.body;

  if (!buyerId || !buyerName)
    return res.status(400).json({ message: "buyerId and buyerName required" });

  const cart = readJSON(CART_FILE) || [];

  let buyerCart = cart.find(
    (c) => String(c.buyerId) === String(buyerId)
  );

  if (!buyerCart) {
    buyerCart = {
      buyerId,
      buyerName,
      farmers: []
    };
    cart.push(buyerCart);
  }

  let farmer = buyerCart.farmers.find(
    (f) => String(f.farmerId) === String(farmerId)
  );

  if (!farmer) {
    farmer = {
      farmerId,
      farmName,
      products: []
    };
    buyerCart.farmers.push(farmer);
  }

  let product = farmer.products.find(
    (p) => String(p.id) === String(id)
  );

  if (product) {
    product.quantity += quantity || 1;
  } else {
    farmer.products.push({
      id,
      name,
      price,
      image,
      quantity: quantity || 1
    });
  }

  writeJSON(CART_FILE, cart);

  res.json(buyerCart);
};

// Update quantity
const updateQty = (req, res) => {
  const { buyerId, farmerId, productId } = req.params;
  const { quantity } = req.body;

  const cart = readJSON(CART_FILE) || [];

  const buyerCart = cart.find(
    (c) => String(c.buyerId) === String(buyerId)
  );

  if (!buyerCart)
    return res.status(404).json({ message: "Cart not found" });

  const farmer = buyerCart.farmers.find(
    (f) => String(f.farmerId) === String(farmerId)
  );

  if (!farmer)
    return res.status(404).json({ message: "Farmer not found" });

  const product = farmer.products.find(
    (p) => String(p.id) === String(productId)
  );

  if (!product)
    return res.status(404).json({ message: "Product not found" });

  product.quantity = quantity;

  writeJSON(CART_FILE, cart);

  res.json(product);
};

// Remove item
const removeItem = (req, res) => {
  const { buyerId, farmerId, productId } = req.params;

  const cart = readJSON(CART_FILE) || [];

  const buyerCart = cart.find(
    (c) => String(c.buyerId) === String(buyerId)
  );

  if (!buyerCart)
    return res.status(404).json({ message: "Cart not found" });

  const farmer = buyerCart.farmers.find(
    (f) => String(f.farmerId) === String(farmerId)
  );

  if (!farmer)
    return res.status(404).json({ message: "Farmer not found" });

  farmer.products = farmer.products.filter(
    (p) => String(p.id) !== String(productId)
  );

  // remove farmer if empty
  buyerCart.farmers = buyerCart.farmers.filter(
    (f) => f.products.length > 0
  );

  writeJSON(CART_FILE, cart);

  res.json({ message: "Item removed", cart: buyerCart });
};

// Clear cart
const clearCart = (req, res) => {
  const { buyerId } = req.params;

  const cart = readJSON(CART_FILE) || [];

  const updatedCart = cart.filter(
    (c) => String(c.buyerId) !== String(buyerId)
  );

  writeJSON(CART_FILE, updatedCart);

  res.json({ message: "Cart cleared" });
};

module.exports = {
  getCart,
  addToCart,
  updateQty,
  removeItem,
  clearCart
};
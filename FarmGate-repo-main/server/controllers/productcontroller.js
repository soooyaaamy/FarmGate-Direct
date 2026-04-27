// const path = require("path");
// const { readJSON, writeJSON } = require("../utils/filehelper");

// const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

// const getProducts = (req, res) => {
//   const products = readJSON(PRODUCTS_FILE);
//   const userId = req.query.userId;  // comes from frontend

//   // Filter by userId only if provided (for farmers)
//   const filteredProducts = userId
//     ? products.filter(p => String(p.userId) === String(userId))
//     : products;

//   res.json(filteredProducts);
// };
// /*
// const getProducts = (req, res) => {
//   const products = readJSON(PRODUCTS_FILE);
//   const userId = req.query.userId;

//   // Filter only if userId is passed
//   const result = userId ? products.filter((p) => p.userId === userId) : products;
//   res.json(result);
// };
// */

// const addProduct = (req, res) => {
//   const products = readJSON(PRODUCTS_FILE);
//   const newProduct = { id: Date.now().toString(), createdAt: Date.now(), ...req.body };
//   products.push(newProduct);
//   writeJSON(PRODUCTS_FILE, products);
//   res.json(newProduct);
// };

// const updateProduct = (req, res) => {
//   const products = readJSON(PRODUCTS_FILE);
//   const index = products.findIndex((p) => String(p.id) === req.params.id);
//   if (index === -1) return res.status(404).json({ message: "Product not found" });
//   products[index] = { ...products[index], ...req.body };
//   writeJSON(PRODUCTS_FILE, products);
//   res.json(products[index]);
// };

// const deleteProduct = (req, res) => {
//   let products = readJSON(PRODUCTS_FILE);
//   const lengthBefore = products.length;
//   products = products.filter((p) => String(p.id) !== req.params.id);
//   if (products.length === lengthBefore)
//     return res.status(404).json({ message: "Product not found" });
//   writeJSON(PRODUCTS_FILE, products);
//   res.json({ message: "Product deleted" });
// };

// module.exports = {
//   getProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// };

const path = require("path");
const { readJSON, writeJSON } = require("../utils/filehelper");

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

/* ================= GET PRODUCTS ================= */

const getProducts = (req, res) => {

  const products = readJSON(PRODUCTS_FILE) || [];

  const farmerId = req.query.farmerId;

  const filteredProducts = farmerId
    ? products.filter(p => String(p.farmerId) === String(farmerId))
    : products;

  res.json(filteredProducts);
};


/* ================= ADD PRODUCT ================= */

const addProduct = (req, res) => {

  const products = readJSON(PRODUCTS_FILE) || [];

  const newProduct = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    ...req.body
  };

  products.push(newProduct);

  writeJSON(PRODUCTS_FILE, products);

  res.json(newProduct);
};


/* ================= UPDATE PRODUCT ================= */

const updateProduct = (req, res) => {

  const products = readJSON(PRODUCTS_FILE) || [];

  const index = products.findIndex(
    p => String(p.id) === String(req.params.id)
  );

  if (index === -1)
    return res.status(404).json({ message: "Product not found" });

  products[index] = {
    ...products[index],
    ...req.body
  };

  writeJSON(PRODUCTS_FILE, products);

  res.json(products[index]);
};


/* ================= DELETE PRODUCT ================= */

const deleteProduct = (req, res) => {

  let products = readJSON(PRODUCTS_FILE) || [];

  const before = products.length;

  products = products.filter(
    p => String(p.id) !== String(req.params.id)
  );

  if (products.length === before)
    return res.status(404).json({ message: "Product not found" });

  writeJSON(PRODUCTS_FILE, products);

  res.json({ message: "Product deleted" });
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
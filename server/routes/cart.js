const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQty,
  removeItem,
  clearCart
} = require("../controllers/cartcontroller");

router.get("/:buyerId", getCart);

router.post("/", addToCart);

router.put("/:buyerId/:farmerId/:productId", updateQty);

router.delete("/:buyerId/:farmerId/:productId", removeItem);

router.delete("/clear/:buyerId", clearCart);

module.exports = router;
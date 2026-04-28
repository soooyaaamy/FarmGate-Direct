const express = require("express");
const router = express.Router();

const { checkout, getFarmerOrders, getOrderById, updateOrderStatus } = require("../controllers/ordercontroller");

router.post("/:buyerId", checkout);
router.get("/farmer/:farmerId/orders", getFarmerOrders);
router.get("/farmer/orders/:orderId", getOrderById);
router.put("/farmer/orders/:orderId/status", updateOrderStatus);
module.exports = router;
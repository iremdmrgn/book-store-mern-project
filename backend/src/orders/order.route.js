const express = require("express");
const { 
  createAOrder, 
  updateOrderStatus, // include the new update endpoint
  getOrderByEmail, 
  getOrderCount, 
  getRecentOrders, 
  getAllOrders 
} = require("./order.controller");

const router = express.Router();

router.post("/", createAOrder);
router.put("/:id", updateOrderStatus); // New route for updating order status
router.get("/email/:email", getOrderByEmail);
router.get("/count", getOrderCount);
router.get("/recent", getRecentOrders);
router.get("/", getAllOrders);

module.exports = router;

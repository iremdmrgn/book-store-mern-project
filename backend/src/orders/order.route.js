const express = require("express");
const { 
  createAOrder, 
  getOrderByEmail, 
  getOrderCount, 
  getRecentOrders, 
  getAllOrders 
} = require("./order.controller");

const router = express.Router();

router.post("/", createAOrder);
router.get("/email/:email", getOrderByEmail);
router.get("/count", getOrderCount);
router.get("/recent", getRecentOrders);
router.get("/", getAllOrders);

module.exports = router;

const Order = require("./order.model");
const Book = require("../books/book.model");
const mongoose = require("mongoose");

const createAOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    console.log("Order saved:", savedOrder);

    for (const item of savedOrder.items) {
      const quantity = Number(item.quantity);
      console.log(`Updating book ${item.productId} by quantity: ${quantity}`);
      const updatedBook = await Book.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -quantity } },
        { new: true }
      );
      console.log("Updated Book:", updatedBook);
    }

    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// New update endpoint for order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    console.log("Order status updated:", updatedOrder);

    // Emit socket event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      io.emit("orderUpdated", updatedOrder);
      console.log("Socket event 'orderUpdated' emitted");
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ email })
      .sort({ createdAt: -1 })
      .populate("items.productId");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this email" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getOrderCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting order count:", error);
    res.status(500).json({ message: "Failed to get order count" });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(recentOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

module.exports = {
  createAOrder,
  updateOrderStatus, // new endpoint added here
  getOrderByEmail,
  getOrderCount,
  getRecentOrders,
  getAllOrders,
};

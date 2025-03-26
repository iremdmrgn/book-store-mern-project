const Order = require("./order.model");
const Book = require("../books/book.model"); // Adjust the path as needed

const createAOrder = async (req, res) => {
  try {
    // Create a new order using the details provided in req.body
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // For each ordered item, update the corresponding book's stock
    for (const item of savedOrder.items) {
      // Use the $inc operator to decrease stock by item.quantity
      await Book.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    // Find orders by email, sort by creation date (descending) and populate product details
    const orders = await Order.find({ email })
      .sort({ createdAt: -1 })
      .populate('items.productId');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this email" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail
};

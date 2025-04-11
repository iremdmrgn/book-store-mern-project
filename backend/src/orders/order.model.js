const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Customer's name
  },
  email: {
    type: String,
    required: true, // Customer's email address
  },
  address: {
    title: { type: String, default: "" },   // EKLE
    street: { type: String, default: "" },  // EKLE
    city: { type: String, required: true },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  
  phone: {
    type: String, // Changed to String to better handle phone numbers
    required: true, // Customer's phone number
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      coverImage: {
        type: String,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    }
  ],
  totalPrice: {
    type: Number,
    required: true, // Total price of the order
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    default: "Pending", // Order status
  },
  // Yeni alanlar
  shippingStatus: {
    type: String,
    default: "Pending", // Sipariş oluşturulurken default olarak "Pending"
  },
  paymentMethod: {
    cardHolder: { type: String },
    cardNumber: { type: String },
    expiryDate: { type: String }
  },
  
  
  
  
  paymentStatus: {
    type: String,
    default: "Unpaid", // Payment status
  },
  shippingCost: {
    type: Number,
    default: 0, // Shipping cost (if applicable)
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Pre-save hook: Generate an order number if not already defined
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
    this.orderNumber = `ORD-${datePart}-${randomPart}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

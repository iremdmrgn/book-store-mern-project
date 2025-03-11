const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID (string)
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  cardHolder: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);

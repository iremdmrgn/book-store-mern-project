const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Ensure userId is a String
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Address = mongoose.model("Address", addressSchema,'addresses');

module.exports = Address;
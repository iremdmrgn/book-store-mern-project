const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID (string)
    required: true,
  },
  title: {
    type: String,
    required: true, // Adres için bir başlık (örneğin: "Ev", "İş")
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    default: "",
  },
  neighborhood: {
    type: String,
    default: "",
  },
  postalCode: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);

// src/account/account.model.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: {
    type: String,
    required: true
  }
  // Other fields if needed...
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);

const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardNumber: { type: String, required: true },
    cardHolder: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema, 'paymentMethods');


module.exports = PaymentMethod;
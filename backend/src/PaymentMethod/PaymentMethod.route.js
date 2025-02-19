const express = require('express');
const router = express.Router();
const PaymentMethod = require('./PaymentMethod.model'); // PaymentMethod modelini import ediyoruz

// Ödeme yöntemi ekleme endpoint'i
router.post('/payment-method', async (req, res) => {
    const { cardNumber, cardHolder, expiryDate, cvv, userId } = req.body;

    try {
        const newPaymentMethod = new PaymentMethod({
            userId,
            cardNumber,
            cardHolder,
            expiryDate,
            cvv,
            createdAt: new Date()
        });

        await newPaymentMethod.save(); // MongoDB'ye kaydet
        res.status(201).json(newPaymentMethod);
    } catch (error) {
        console.error('Error saving payment method:', error);
        res.status(500).json({ message: 'Error saving payment method', error: error.message });
    }
});

// Ödeme yöntemini kullanıcıya göre getirme endpoint'i
router.get('/payment-method/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const paymentMethods = await PaymentMethod.find({ userId }); // Kullanıcının ödeme yöntemlerini getir
        if (paymentMethods.length > 0) {
            res.status(200).json(paymentMethods);
        } else {
            res.status(404).json({ message: 'No payment methods found for this user' });
        }
    } catch (error) {
        console.error('Error retrieving payment methods:', error);
        res.status(500).json({ message: 'Error retrieving payment methods', error: error.message });
    }
});

module.exports = router;
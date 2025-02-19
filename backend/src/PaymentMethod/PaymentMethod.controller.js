const PaymentMethod = require('./PaymentMethod.model'); // Ödeme yöntemi modeli


const addPaymentMethod = async (req, res) => {
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
        res.status(500).json({ message: 'Error saving payment method', error: error.message });
    }
};


const getAllPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find();
        res.status(200).json(paymentMethods);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
    }
};

const getPaymentMethodByUser = async (req, res) => {
    const { userId } = req.params;
    
    try {
        const paymentMethod = await PaymentMethod.findOne({ userId });

        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }

        res.status(200).json(paymentMethod);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment method', error: error.message });
    }
};

module.exports = {
    addPaymentMethod,
    getAllPaymentMethods,
    getPaymentMethodByUser
};
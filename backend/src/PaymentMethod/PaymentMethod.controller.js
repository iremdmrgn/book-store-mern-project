const PaymentMethod = require('./PaymentMethod');

// Kullanıcının ödeme yöntemlerini getirir
exports.getPaymentMethods = async (req, res) => {
  const { userId } = req.params;
  try {
    const methods = await PaymentMethod.find({ userId });
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yeni ödeme yöntemi ekler
exports.addPaymentMethod = async (req, res) => {
  const { userId } = req.params;
  const newMethod = req.body; // cardNumber, expiryDate, cvv, cardHolder beklenir.
  try {
    const paymentMethod = new PaymentMethod({ userId, ...newMethod });
    await paymentMethod.save();
    res.status(201).json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir ödeme yöntemini siler
exports.deletePaymentMethod = async (req, res) => {
  const { userId, methodId } = req.params;
  try {
    const method = await PaymentMethod.findOneAndDelete({ _id: methodId, userId });
    if (!method) return res.status(404).json({ message: "Payment method not found" });
    res.status(200).json({ message: "Payment method deleted", method });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// (Opsiyonel) Ödeme yöntemini günceller
exports.updatePaymentMethod = async (req, res) => {
  const { userId, methodId } = req.params;
  const updateData = req.body;
  try {
    const method = await PaymentMethod.findOneAndUpdate(
      { _id: methodId, userId },
      updateData,
      { new: true }
    );
    if (!method) return res.status(404).json({ message: "Payment method not found" });
    res.status(200).json(method);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

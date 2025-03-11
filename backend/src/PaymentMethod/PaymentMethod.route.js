const express = require('express');
const router = express.Router();
const paymentMethodController = require('./PaymentMethod.controller');

// Kullanıcının ödeme yöntemlerini getir
router.get('/:userId', paymentMethodController.getPaymentMethods);

// Yeni ödeme yöntemi ekle
router.post('/:userId', paymentMethodController.addPaymentMethod);

// Belirli bir ödeme yöntemini güncelle (opsiyonel)
router.put('/:userId/:methodId', paymentMethodController.updatePaymentMethod);

// Belirli bir ödeme yöntemini sil
router.delete('/:userId/:methodId', paymentMethodController.deletePaymentMethod);

module.exports = router;

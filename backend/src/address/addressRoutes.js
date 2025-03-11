const express = require('express');
const router = express.Router();
const addressController = require('./addressController');

// Kullanıcının tüm adreslerini getir (GET /api/address/:userId)
router.get('/:userId', addressController.getAddresses);

// Yeni adres ekler (POST /api/address/:userId)
router.post('/:userId', addressController.addAddress);

// Belirli bir adresi günceller (PUT /api/address/:userId/:addressId)
router.put('/:userId/:addressId', addressController.updateAddress);

// Belirli bir adresi siler (DELETE /api/address/:userId/:addressId)
router.delete('/:userId/:addressId', addressController.deleteAddress);

module.exports = router;

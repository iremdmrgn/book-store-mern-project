// src/cart/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('./cartController');

// Kullanıcının sepetini getir
router.get('/:userId', cartController.getCart);

// Sepete ürün ekle
router.post('/:userId', cartController.addToCart);

// Sepetteki bir ürünün miktarını güncelle (itemId ile)
router.put('/:userId/item/:itemId', cartController.updateCartItem);

// Sepetten bir ürünü sil (itemId ile)
router.delete('/:userId/item/:itemId', cartController.deleteCartItem);

// Sepeti tamamen temizle
router.delete('/:userId', cartController.clearCart);

module.exports = router;

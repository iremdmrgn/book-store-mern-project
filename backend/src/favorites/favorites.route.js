const express = require('express');
const router = express.Router();
const favoritesController = require('./favoritesController');

// Kullanıcının favorilerini getir
router.get('/:userId', favoritesController.getFavorites);

// Favorilere ürün ekle
router.post('/:userId', favoritesController.addFavorite);

// Favorilerden bir ürünü sil (productId üzerinden)
router.delete('/:userId/item/:itemId', favoritesController.removeFavorite);

// Tüm favorileri temizle
router.delete('/:userId', favoritesController.clearFavorites);

module.exports = router;

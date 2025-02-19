const express = require('express');
const { createAOrder, getOrderByEmail } = require('./order.controller');

const router = express.Router();

// Sipariş oluşturma endpoint'i
router.post("/", createAOrder);

// Kullanıcı email'ine göre siparişleri getirme endpoint'i
router.get("/email/:email", getOrderByEmail);

// Diğer gerekli endpoint'ler burada tanımlanabilir (örneğin, sipariş güncelleme veya silme)

// Modülü dışarıya aktarıyoruz
module.exports = router;
const express = require('express');
const router = express.Router();
const reviewController = require('./reviewController');

// Yeni yorum ekleme
router.post('/', reviewController.addReview);

// Kullanıcının yorumlarını getir
router.get('/user/:userId', reviewController.getReviewsByUser);

// Bir kitaba ait yorumları getir
router.get('/book/:bookId', reviewController.getReviewsByBook);




module.exports = router;

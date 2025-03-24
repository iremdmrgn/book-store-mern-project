const express = require('express');
const Book = require('./book.model');
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook } = require('./book.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const upload = require('../utils/multerConfig'); // Multer yapılandırma dosyanızın yolu
const router = express.Router();

// POST: Kitap oluştururken dosya yüklemesini gerçekleştiriyoruz.
router.post("/create-book", verifyAdminToken, upload.single('coverImageFile'), postABook);

// GET: Tüm kitapları getir
router.get("/", getAllBooks);

// GET: Tekil kitap bilgisi
router.get("/:id", getSingleBook);

// PUT: Kitap güncelleme (dosya güncellemesi için multer middleware ekleniyor)
router.put("/edit/:id", verifyAdminToken, upload.single('coverImageFile'), UpdateBook);

// DELETE: Kitap silme
router.delete("/:id", verifyAdminToken, deleteABook);

// GET: Arama fonksiyonu
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query; // Kullanıcıdan gelen arama sorgusu

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Arama sorgusu boş olamaz.' });
    }

    // Kitap başlığı ve yazar adı üzerinde arama yap
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },   // Kitap başlığında arama yap
        { author: { $regex: query, $options: 'i' } }     // Yazar adında arama yap
      ]
    });

    // Eğer kitap bulunamazsa
    if (books.length === 0) {
      return res.status(404).json({ message: 'Hiçbir kitap bulunamadı.' });
    }

    res.json(books); // Bulunan kitapları frontend'e gönder
  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({ error: 'Arama sırasında bir hata oluştu.' });
  }
});

module.exports = router;

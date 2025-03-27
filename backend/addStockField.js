// addStockField.js
const mongoose = require('mongoose');
const Book = require('./src/books/book.model'); // Güncel yol

const DB_URL = "mongodb+srv://iremdemiregen:2018Mumu@cluster0.evuac.mongodb.net/book-store?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Veritabanına bağlanıldı. Migration başlatılıyor...");
    // "stock" alanı olmayan kitapları buluyoruz
    const booksWithoutStock = await Book.find({ stock: { $exists: false } });
    console.log(`${booksWithoutStock.length} kitap güncellenecek.`);
    
    for (const book of booksWithoutStock) {
      book.stock = 100; // Varsayılan stok değeri
      await book.save();
    }
    
    console.log("Migration tamamlandı.");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Bağlantı hatası veya migration hatası:", err);
    mongoose.disconnect();
  });

const mongoose = require('mongoose');
const Book = require('./book.model'); // Modelin doğru yolunu kontrol edin
const updatedBooks = require('./books.json'); // JSON dosyanızın yolu

const mongoURI = "mongodb+srv://iremdemiregen:2018Mumu@cluster0.evuac.mongodb.net/book-store?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB Atlas'a bağlanıldı.");

    for (const updatedBook of updatedBooks) {
      const result = await Book.findOneAndUpdate(
        { title: { $regex: `^${updatedBook.title}$`, $options: 'i' } }, // başlık üzerinden eşleştiriyoruz
        updatedBook,
        { new: true, upsert: true }
      );
      console.log(`"${updatedBook.title}" için güncelleme sonucu:`, result);
    }

    console.log("Migration tamamlandı!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration sırasında hata oluştu:", err);
    process.exit(1);
  });

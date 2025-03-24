const Book = require("./book.model");

const postABook = async (req, res) => {
  try {
    // Eğer dosya yüklenmişse, dosya yolunu oluşturuyoruz; yoksa boş string
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    // Yeni kitap oluşturulurken req.body'nin yanı sıra coverImage alanı da ekleniyor.
    const newBook = new Book({ ...req.body, coverImage: imageUrl });
    await newBook.save();
    res.status(200).send({ message: "Book posted successfully", book: newBook });
  } catch (error) {
    console.error("Error creating book", error);
    res.status(500).send({ message: "Failed to create book" });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};

    if (query && query.trim() !== '') {
      filter = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).send({ message: "Failed to fetch books" });
  }
};

const getSingleBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send({ message: "Book not Found!" });
    }
    res.status(200).send(book);
  } catch (error) {
    console.error("Error fetching book", error);
    res.status(500).send({ message: "Failed to fetch book" });
  }
};

const UpdateBook = async (req, res) => {
  try {
    // Eğer yeni bir dosya yüklenmişse, coverImage alanını güncelle
    if (req.file) {
      req.body.coverImage = `/uploads/${req.file.filename}`;
    }
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBook) {
      return res.status(404).send({ message: "Book not found!" });
    }
    res.status(200).send({
      message: "Book updated successfully",
      book: updatedBook
    });
  } catch (error) {
    console.error("Error updating a book", error);
    res.status(500).send({ message: "Failed to update book" });
  }
};

const deleteABook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).send({ message: "Book not found!" });
    }
    res.status(200).send({
      message: "Book deleted successfully",
      book: deletedBook
    });
  } catch (error) {
    console.error("Error deleting a book", error);
    res.status(500).send({ message: "Failed to delete book" });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Arama sorgusu boş olamaz.' });
    }

    console.log('Arama Sorgusu:', query);

    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    });

    if (books.length === 0) {
      return res.status(404).json({ message: 'Hiçbir kitap bulunamadı.' });
    }

    res.status(200).send(books);
  } catch (error) {
    console.error("Error during search", error);
    res.status(500).send({ message: "Search failed" });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  searchBooks
};

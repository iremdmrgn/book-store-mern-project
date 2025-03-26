const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description:  {
    type: String,
    required: true,
  },
  category:  {
    type: String,
    required: true,
  },
  trending: {
    type: Boolean,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 100, // Varsayılan stok değeri 100
  },
  // Ek alanlar:
  author: {
    type: String,
    default: 'Unknown'
  },
  publisher: {
    type: String,
    default: 'Unknown Publisher'
  },
  language: {
    type: String,
    default: 'English'
  },
  editionYear: {
    type: Number,
    default: null
  },
  paperType: {
    type: String,
    default: 'Standard'
  },
  pageCount: {
    type: Number,
    default: null
  },
  dimensions: {
    type: String,
    default: 'N/A'
  },
  editionNumber: {
    type: String,
    default: 'N/A'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

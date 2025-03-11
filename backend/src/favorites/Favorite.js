// src/favorites/Favorite.js
const mongoose = require('mongoose');

const FavoriteItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  coverImage: { type: String },
  newPrice: { type: Number, required: true }
  // İhtiyacınıza göre ek alanlar ekleyebilirsiniz.
});

const FavoriteSchema = new mongoose.Schema({
  // Firebase UID'leri string olduğu için userId'yi String olarak tanımlıyoruz.
  userId: { type: String, required: true, unique: true },
  items: [FavoriteItemSchema],
}, { timestamps: true });

// Opsiyonel: Kaydetmeden önce userId'yi trimleyelim
FavoriteSchema.pre('save', function(next) {
  if (this.userId) {
    this.userId = this.userId.trim();
  }
  next();
});

module.exports = mongoose.model('Favorite', FavoriteSchema);

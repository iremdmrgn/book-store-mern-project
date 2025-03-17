const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  coverImage: { type: String },
  newPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const CartSchema = new mongoose.Schema({
  // Firebase uid'leri string olduğu için, userId alanını String olarak tanımlıyoruz.
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

// Pre-save hook: userId değerini kaydetmeden önce trim uygula
CartSchema.pre('save', function(next) {
  if (this.userId) {
    this.userId = this.userId.trim();
  }
  next();
});

// Kullanıcının sepetini temizlemek için statik metod
CartSchema.statics.clearCartForUser = async function(userId) {
  return this.findOneAndUpdate({ userId: userId.trim() }, { items: [] }, { new: true });
};

module.exports = mongoose.model('Cart', CartSchema);

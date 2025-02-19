const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Siparişin sahibi olan kullanıcı adı
  },
  email: {
    type: String,
    required: true, // Siparişin sahibinin e-posta adresi
  },
  address: {
    city: {
      type: String,
      required: true, // Şehir adı
    },
    country: String, // Ülke (isteğe bağlı)
    state: String, // Eyalet (isteğe bağlı)
    zipcode: String, // Posta kodu (isteğe bağlı)
  },
  phone: {
    type: Number,
    required: true, // Sipariş verenin telefon numarası
  },
  productIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book', // Sipariş edilen kitapların ID'leri
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
    required: true, // Toplam fiyat
  },
}, {
  timestamps: true, // Siparişin oluşturulma tarihi ve güncellenme tarihi
});

// Modeli oluşturuyoruz
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Sipariş sahibinin adı
  },
  email: {
    type: String,
    required: true, // Sipariş sahibinin e-posta adresi
  },
  address: {
    city: {
      type: String,
      required: true, // Şehir adı
    },
    country: {
      type: String,
      default: "", // Ülke (isteğe bağlı)
    },
    state: {
      type: String,
      default: "", // Eyalet (isteğe bağlı)
    },
    zipcode: {
      type: String,
      default: "", // Posta kodu (isteğe bağlı)
    },
  },
  phone: {
    type: Number,
    required: true, // Sipariş verenin telefon numarası
  },
  // Siparişe ait ürün bilgilerini saklamak için "items" alanı oluşturabilirsiniz.
  // Burada her ürün için, kitap ID'si, fiyatı ve miktarı gibi bilgiler yer alabilir.
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      coverImage: String,
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    }
  ],
  totalPrice: {
    type: Number,
    required: true, // Siparişin toplam fiyatı
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    default: "Pending", // Sipariş durumu; gerekirse frontend'de bu alanı gizleyebilirsiniz.
  }
}, {
  timestamps: true, // Siparişin oluşturulma ve güncellenme tarihleri
});

// Pre-save hook: Eğer orderNumber tanımlı değilse, otomatik oluştur.
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4 basamaklı rastgele sayı
    this.orderNumber = `ORD-${datePart}-${randomPart}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

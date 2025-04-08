const mongoose = require('mongoose');
const Order = require('./orders/order.model'); // Order modelinizin yolu: backend/src/orders/order.model.js

const MONGO_URI = "mongodb+srv://iremdemiregen:2018Mumu@cluster0.evuac.mongodb.net/book-store?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(async () => {
    console.log("MongoDB'ye başarıyla bağlanıldı.");

    // shippingStatus alanı olmayan veya tanımlanmamış tüm siparişlere varsayılan "Pending" değerini ekleyelim.
    const result = await Order.updateMany(
      { shippingStatus: { $exists: false } }, 
      { $set: { shippingStatus: "Pending" } }
    );

    console.log(`Migration tamamlandı: ${result.nModified} kayıt güncellendi.`);
    mongoose.disconnect();
    process.exit();
  })
  .catch(err => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

const Order = require("./order.model");

const createAOrder = async (req, res) => {
  try {
    // Yeni siparişi oluşturuyoruz
    const newOrder = new Order(req.body);

    // Siparişi veritabanına kaydediyoruz
    const savedOrder = await newOrder.save();

    // Başarılı olursa kaydedilen siparişi geri gönderiyoruz
    res.status(200).json(savedOrder);
  } catch (error) {
    // Hata durumunda 500 hatası dönüyoruz
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Kullanıcıya ait email alınıyor
    const orders = await Order.find({ email }).sort({ createdAt: -1 }); // Siparişler email'e göre sıralanıyor

    // Eğer sipariş bulunamazsa 404 dönüyoruz
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this email" });
    }

    // Siparişler bulunduğunda 200 ile döndürüyoruz
    res.status(200).json(orders);
  } catch (error) {
    // Hata durumunda 500 hatası dönüyoruz
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail
};
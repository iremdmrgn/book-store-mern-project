const Order = require("./order.model");

// Yeni sipariş oluşturma fonksiyonu
const createAOrder = async (req, res) => {
  try {
    // req.body, order detaylarını (name, email, address, phone, items, totalPrice, vs.) içermelidir.
    const newOrder = new Order(req.body);

    // Siparişi veritabanına kaydediyoruz
    const savedOrder = await newOrder.save();

    // Başarılı olursa kaydedilen siparişi geri gönderiyoruz
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// Email'e göre siparişleri getirme fonksiyonu
const getOrderByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Kullanıcıya ait e-posta alınıyor
    // Siparişleri email'e göre buluyor, sıralıyor ve items.productId alanını populate ediyoruz
    const orders = await Order.find({ email })
      .sort({ createdAt: -1 })
      .populate('items.productId');
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this email" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail
};

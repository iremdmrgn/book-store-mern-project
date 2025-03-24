const Order = require('../orders/order.model');
const Book = require('../books/book.model');

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Sipariş verileri
    const orderCount = await Order.countDocuments({});
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
    const ordersLeft = await Order.countDocuments({ status: "Pending" });
    
    // 2. Aylık satış gelirleri (Revenue Chart)
    // Siparişlerin "totalPrice" alanını kullanarak aylık toplam geliri hesaplıyoruz.
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Kitap verileri
    const totalBooks = await Book.countDocuments({});
    
    // 4. Bu ay en çok satılan kitaplar
    // Siparişlerin içindeki "items" dizisini açıp (unwind), kitap bazında satılan miktarı toplayıp en çok satılan 5 ürünü getiriyoruz.
    const bestSellingBooks = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",           // MongoDB'de kitap koleksiyonunuzun adı; genelde küçük harf ve çoğul olur ("books")
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails"
        }
      }
    ]);

    res.json({
      orderCount,
      recentOrders,
      ordersLeft,
      revenueData,
      totalBooks,
      bestSellingBooks
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

const Order = require('../orders/order.model');
const Book = require('../books/book.model');

exports.getDashboardData = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments({});
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
    const ordersLeft = await Order.countDocuments({ status: "Pending" });
    
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totalBooks = await Book.countDocuments({});
    
    res.json({ orderCount, recentOrders, ordersLeft, revenueData, totalBooks });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

exports.getBestSellingBooks = async (req, res) => {
  try {
    // Sabit tarih aralığı: 1 Mart 2025 - 31 Mart 2025 (UTC)
    const startOfMonthUTC = new Date(Date.UTC(2025, 2, 1)); // 2025-03-01T00:00:00.000Z
    const endOfMonthUTC = new Date(Date.UTC(2025, 3, 0, 23, 59, 59)); // 2025-03-31T23:59:59.000Z

    const bestSellingBooks = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          title: { $first: "$items.title" } // Order içindeki title bilgisini kullanıyoruz.
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json(bestSellingBooks);
  } catch (error) {
    console.error("En çok satan kitaplar alınırken hata:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


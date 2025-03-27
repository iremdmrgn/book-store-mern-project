const express = require('express');
const router = express.Router();
const Order = require('../orders/order.model'); // Order modelinizin yolu
const Book = require('../books/book.model');      // Book modelinizin yolu

// GET /api/dashboard/best-selling-books
router.get('/best-selling-books', async (req, res) => {
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
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      // Eğer productId zaten ObjectId tipindeyse bu aşamaya gerek yoktur.
      {
        $addFields: {
          productObjId: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "books",
          localField: "productObjId",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      { $unwind: "$bookDetails" },
      // İhtiyacınız olan alanları belirleyin; örneğin kitap başlığı, kapak resmi vb.
      {
        $project: {
          _id: 0,
          productId: "$_id",
          totalSold: 1,
          title: "$bookDetails.title",
          coverImage: "$bookDetails.coverImage"
          // İhtiyacınıza göre başka alanlar da ekleyebilirsiniz.
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
});

module.exports = router;

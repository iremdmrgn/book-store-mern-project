const Review = require('./Review');

// Yeni yorum ekleme
exports.addReview = async (req, res) => {
  const { bookId, userId, reviewer, rating, text } = req.body;
  try {
    const review = new Review({ bookId, userId, reviewer, rating, text });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir kullanıcıya ait yorumları getirir
exports.getReviewsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir kitaba ait yorumları getirir
exports.getReviewsByBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const reviews = await Review.find({ bookId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yorum silme fonksiyonu
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  try {
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully", review: deletedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

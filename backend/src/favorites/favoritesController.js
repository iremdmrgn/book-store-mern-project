const Favorite = require('./Favorite');

// Kullanıcının favorilerini getir (Eğer yoksa oluşturur)
exports.getFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    let favorites = await Favorite.findOne({ userId });
    if (!favorites) {
      favorites = new Favorite({ userId, items: [] });
      await favorites.save();
    }
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Favorilere ürün ekle
// Eklerken, kitap objesinin id'sini productId olarak atadığınızdan emin olun.
exports.addFavorite = async (req, res) => {
  const { userId } = req.params;
  const newItem = req.body; // newItem: { productId, title, coverImage, newPrice }
  try {
    // Aynı productId'ye sahip öğe varsa eklemez.
    const favorites = await Favorite.findOneAndUpdate(
      { userId },
      { $addToSet: { items: newItem } },
      { new: true, upsert: true }
    );
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Favorilerden ürünü sil (productId üzerinden)
// Değişiklik: Eğer ürünün productId'si mevcut değilse, _id üzerinden de eşleşme yapıyoruz.
exports.removeFavorite = async (req, res) => {
  const { userId, itemId } = req.params;
  try {
    // Favori öğesini, alt belge içindeki productId veya _id alanına göre kaldırıyoruz.
    const favorites = await Favorite.findOneAndUpdate(
      { userId },
      { $pull: { items: { $or: [{ productId: itemId }, { _id: itemId }] } } },
      { new: true }
    );
    if (!favorites) return res.status(404).json({ message: 'Favorites not found' });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm favorileri temizle
exports.clearFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const favorites = await Favorite.findOne({ userId });
    if (!favorites) return res.status(404).json({ message: 'Favorites not found' });
    
    favorites.items = [];
    await favorites.save();
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

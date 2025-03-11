// src/favorites/favoritesController.js
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
// Duplicate key hatasını önlemek için findOneAndUpdate upsert kullanıyoruz.
exports.addFavorite = async (req, res) => {
  const { userId } = req.params;
  const newItem = req.body; // newItem: productId, title, coverImage, newPrice gibi alanları içermeli.
  try {
    // $addToSet kullanarak, eğer aynı productId'ye sahip bir öğe yoksa ekler.
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

// Favorilerden bir ürünü sil
exports.removeFavorite = async (req, res) => {
  const { userId, itemId } = req.params;
  try {
    const favorites = await Favorite.findOne({ userId });
    if (!favorites) return res.status(404).json({ message: 'Favorites not found' });
    
    // Mongoose'un pull() metodunu kullanarak silme işlemi yapıyoruz.
    favorites.items.pull(itemId);
    await favorites.save();
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

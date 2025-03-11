// src/cart/cartController.js
const Cart = require('./Cart');

// Kullanıcının sepetini getir (Eğer yoksa oluşturur)
exports.getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sepete ürün ekle
exports.addToCart = async (req, res) => {
  const { userId } = req.params;
  const newItem = req.body; // newItem: productId, title, coverImage, newPrice, quantity gibi alanları içermeli.
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [newItem] });
    } else {
      // Aynı ürün varsa, miktarını güncelle, yoksa ekle.
      const existingItem = cart.items.find(item => item.productId.toString() === newItem.productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        cart.items.push(newItem);
      }
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sepetteki bir ürünün miktarını güncelle
exports.updateCartItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    
    item.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sepetten bir ürünü sil
exports.deleteCartItem = async (req, res) => {
  const { userId, itemId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    // Mongoose'un pull() metodunu kullanarak itemId'ye sahip öğeyi kaldırıyoruz.
    cart.items.pull(itemId);
    
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sepeti tamamen temizle
exports.clearCart = async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = [];
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require('../user.model'); // Admin kullanıcılarınız User modelinde saklanıyorsa

// Adminin son okunan sipariş sayısını döndüren fonksiyon
const getLastSeenOrderCount = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ lastSeenOrderCount: admin.lastSeenOrderCount });
  } catch (error) {
    console.error("Error getting lastSeenOrderCount:", error);
    res.status(500).json({ message: "Failed to get last seen order count" });
  }
};

// Adminin son okunan sipariş sayısını güncelleyen fonksiyon
const updateLastSeenOrderCount = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { lastSeenOrderCount } = req.body;
    const admin = await User.findByIdAndUpdate(
      adminId,
      { lastSeenOrderCount },
      { new: true }
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ lastSeenOrderCount: admin.lastSeenOrderCount });
  } catch (error) {
    console.error("Error updating lastSeenOrderCount:", error);
    res.status(500).json({ message: "Failed to update last seen order count" });
  }
};

module.exports = {
  getLastSeenOrderCount,
  updateLastSeenOrderCount,
};

const Notification = require('./notificationModel');

// Belirli bir kullanıcıya ait okunmamış bildirimleri getirir
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      user: userId,
      isRead: false
    }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sunucu hatası: Bildirimler getirilemedi.' });
  }
};

// Tek bir bildirimi okunmuş olarak işaretler
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ error: 'Bildirim bulunamadı.' });
    }
    return res.json(updatedNotification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sunucu hatası: Bildirim güncellenemedi.' });
  }
};

// (Opsiyonel) Yeni bildirim oluşturur
exports.createNotification = async (req, res) => {
  try {
    const { user, message } = req.body;
    const newNotification = new Notification({ user, message });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sunucu hatası: Bildirim oluşturulamadı.' });
  }
};

const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');

// Kullanıcının okunmamış bildirimlerini getir (GET /api/notifications/:userId)
router.get('/:userId', notificationController.getUnreadNotifications);

// Bir bildirimi okunmuş olarak işaretle (PUT /api/notifications/:notificationId)
router.put('/:notificationId', notificationController.markNotificationAsRead);

// (Opsiyonel) Yeni bildirim oluştur (POST /api/notifications)
router.post('/', notificationController.createNotification);

module.exports = router;

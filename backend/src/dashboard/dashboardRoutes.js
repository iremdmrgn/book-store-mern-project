const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboardController');

// Dashboard verilerini döndüren endpoint
router.get('/', dashboardController.getDashboardData);

module.exports = router;

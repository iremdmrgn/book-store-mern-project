const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboardController');

router.get('/', dashboardController.getDashboardData);
router.get('/best-selling-books', (req, res) => {
  console.log("Best selling books route tetiklendi");
  dashboardController.getBestSellingBooks(req, res);
});

module.exports = router;

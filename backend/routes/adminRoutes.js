const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 🔒 Dashboard admin
router.get('/dashboard', protect, isAdmin, getAdminDashboardStats);

module.exports = router;

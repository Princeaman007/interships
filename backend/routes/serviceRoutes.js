const express = require('express');
const router = express.Router();
const { getServiceBySlug, updateServiceBySlug } = require('../controllers/serviceController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 🔓 Public
router.get('/:slug', getServiceBySlug);

// 🔒 Admin
router.put('/:slug', protect, isAdmin, updateServiceBySlug);

module.exports = router;

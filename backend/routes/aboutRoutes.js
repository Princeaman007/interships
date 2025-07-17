const express = require('express');
const router = express.Router();
const { getAboutPage, updateAboutPage } = require('../controllers/aboutController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 🔓 Public
router.get('/:slug', getAboutPage);

// 🔒 Admin
router.put('/:slug', protect, isAdmin, updateAboutPage);

module.exports = router;

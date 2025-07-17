const express = require('express');
const router = express.Router();
const { getAllFaq } = require('../controllers/faqController');

const {
  createFaq,
  updateFaq,
  deleteFaq
} = require('../controllers/faqController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { faqValidator } = require('../validators/faqValidator');
const validate = require('../middlewares/validate');

// 🔓 Route publique
router.get('/', getAllFaq);

router.post('/', protect, isAdmin, faqValidator,validate, createFaq);
router.put('/:id', protect, isAdmin, faqValidator,validate, updateFaq);
router.delete('/:id', protect, isAdmin, deleteFaq);

module.exports = router;

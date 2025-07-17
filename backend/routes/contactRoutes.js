const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllMessages,
  getMessageById,
  replyToMessage,
  deleteMessage
} = require('../controllers/contactController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createContactMessageValidator,
  replyToContactValidator
} = require('../validators/contactValidator');

// 🔓 Route publique
router.post('/', createContactMessageValidator, validate, submitContactForm);

// 🔒 Admin
router.get('/admin/all', protect, isAdmin, getAllMessages);
router.get('/admin/:id', protect, isAdmin, getMessageById);
router.patch('/admin/reply/:id', protect, isAdmin, replyToContactValidator, validate, replyToMessage);
router.delete('/admin/:id', protect, isAdmin, deleteMessage);

module.exports = router;

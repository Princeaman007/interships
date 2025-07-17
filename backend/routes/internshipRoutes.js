const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { createInternshipValidator } = require('../validators/internshipValidator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload'); // 🟢 Manquait ici !

// 🔐 Admin
router.post(
  '/',
  protect,
  isAdmin,
  upload.single('image'), // ⬅️ gère l’upload d’une image
  createInternshipValidator,
  validate,
  internshipController.createInternship
);

router.get('/', protect, internshipController.getAllInternships);
router.put('/:id', protect, isAdmin, internshipController.updateInternship);
router.delete('/:id', protect, isAdmin, internshipController.deleteInternship);
router.get('/:id', internshipController.getInternshipById);


// 🔓 Public
router.get('/public', internshipController.getPublicInternships);

module.exports = router;

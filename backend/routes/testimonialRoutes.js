const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createTestimonialValidator } = require('../validators/testimonialValidator');

// 🌟 1. Soumettre un témoignage (étudiant ou admin connecté)
router.post('/', protect, createTestimonialValidator, validate, testimonialController.submitTestimonial);

// 🌍 2. Voir les témoignages approuvés (public)
router.get('/', testimonialController.getApprovedTestimonials);

// 👁 3. Voir un témoignage approuvé par ID
router.get('/:id', testimonialController.getTestimonialById);

// 🛡 4. Voir tous les témoignages (admin/superAdmin)
router.get('/admin/all', protect, isAdmin, testimonialController.getAllTestimonialsAdmin);

// ✅ 5. Approuver un témoignage
router.patch('/:id/approve', protect, isAdmin, testimonialController.approveTestimonial);

// 🗑 6. Supprimer un témoignage
router.delete('/:id', protect, isAdmin, testimonialController.deleteTestimonial);

module.exports = router;

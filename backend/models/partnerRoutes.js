const contentController = require('../controllers/partnerContentController');
const { getAllPartnerRequests, deletePartnerRequest } = require('../controllers/partnerRequestController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {
  getAllTestimonialsAdmin,
  approveTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');

// 🔒 Admin
router.get('/admin/all', protect, isAdmin, getAllTestimonialsAdmin);
router.patch('/admin/approve/:id', protect, isAdmin, approveTestimonial);
router.delete('/admin/:id', protect, isAdmin, deleteTestimonial);


// 🔓 Route publique
router.get('/page', contentController.getPartnerPageContent);

// 🔒 Route admin
router.put('/page', protect, isAdmin, contentController.updatePartnerPageContent);



// 🔒 Voir toutes les demandes
router.get('/requests', protect, isAdmin, getAllPartnerRequests);

// 🔒 Supprimer une demande
router.delete('/requests/:id', protect, isAdmin, deletePartnerRequest);


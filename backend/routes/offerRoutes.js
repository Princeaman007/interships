const express = require('express');
const router = express.Router();
const { submitOffer } = require('../controllers/offerController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { getAllOffers, deleteOffer,getOfferById,  } = require('../controllers/offerController');
const { submitOfferValidator } = require('../validators/offerValidator');
const validate = require('../middlewares/validate');

// Formulaire public
router.post('/submit', submitOfferValidator,validate, submitOffer);
// 🔒 Admin : voir toutes les offres
router.get('/admin/all', protect, isAdmin, getAllOffers);
router.get('/admin/:id', protect, isAdmin, getOfferById);

// 🔒 Admin : supprimer une offre
router.delete('/admin/:id', protect, isAdmin, deleteOffer);


module.exports = router;

const express = require('express');
const router = express.Router();
const { createPartnerRequest } = require('../controllers/partnerRequestController');
const { createPartnerRequestValidator } = require('../validators/partnerValidator');
const validate = require('../middlewares/validate');

// 📥 Formulaire public "devenir partenaire"
router.post('/request', createPartnerRequest,validate, createPartnerRequest);

module.exports = router;

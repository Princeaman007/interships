const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { isAdmin, isétudiant, protect } = require('../middlewares/authMiddleware');
const { createApplicationValidator, updateApplicationValidator } = require('../validators/applicationValidator');
const validate = require('../middlewares/validate');

// 🏥 Route de santé pour les applications
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Applications API',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'POST /api/applications - Postuler à une offre',
      'GET /api/applications/me - Mes candidatures',
      'GET /api/applications/etudiant/:studentId - Candidatures d\'un étudiant',
      'GET /api/applications/all - Toutes les candidatures (Admin)',
      'GET /api/applications/:id - Une candidature spécifique',
      'PUT /api/applications/me/:id - Modifier ma candidature',
      'DELETE /api/applications/me/:id - Supprimer ma candidature',
      'PATCH /api/applications/:id/status - Modifier le statut (Admin)'
    ]
  });
});

// 📝 Étudiant postule à une offre
router.post('/', 
  protect, 
  isétudiant, 
  createApplicationValidator, 
  validate, 
  applicationController.applyToInternship
);

// 👤 Routes pour les candidatures de l'étudiant connecté
router.get('/me', 
  protect, 
  isétudiant, 
  applicationController.getMyApplications
);

router.delete('/me/:id', 
  protect, 
  isétudiant, 
  applicationController.deleteMyApplication
);

router.put('/me/:id', 
  protect, 
  isétudiant, 
  updateApplicationValidator, 
  validate, 
  applicationController.updateMyApplication
);

// 🎯 Route pour les candidatures d'un étudiant spécifique
// IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
router.get('/etudiant/:studentId', 
  protect, 
  (req, res, next) => {
    // Middleware de validation de l'ID étudiant
    const { studentId } = req.params;
    
    // Vérifier que l'ID est valide (format MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(studentId)) {
      return res.status(400).json({
        error: 'Invalid student ID format',
        message: 'L\'ID étudiant doit être un ObjectId MongoDB valide',
        received: studentId
      });
    }
    
    console.log(`🔍 Accès aux candidatures de l'étudiant: ${studentId} par ${req.user._id}`);
    next();
  },
  applicationController.getApplicationsByStudent
);

// 👨‍💼 Routes admin
router.get('/all', 
  protect, 
  isAdmin, 
  (req, res, next) => {
    console.log(`👨‍💼 Admin ${req.user._id} accède à toutes les candidatures`);
    next();
  },
  applicationController.getAllApplications
);

router.patch('/:id/status', 
  protect, 
  isAdmin, 
  (req, res, next) => {
    const { status } = req.body;
    console.log(`👨‍💼 Admin ${req.user._id} change le statut de ${req.params.id} vers "${status}"`);
    
    // Validation du statut
    if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Le statut doit être: pending, accepted, rejected, ou withdrawn',
        received: status,
        allowedValues: ['pending', 'accepted', 'rejected', 'withdrawn']
      });
    }
    
    next();
  },
  applicationController.updateApplicationStatus
);

// 🔍 Route pour une candidature spécifique
// ATTENTION: Cette route doit être EN DERNIER pour éviter les conflits avec les routes spécifiques
router.get('/:id', 
  protect, 
  (req, res, next) => {
    const { id } = req.params;
    
    // Vérifier que l'ID est valide
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid application ID format',
        message: 'L\'ID de candidature doit être un ObjectId MongoDB valide',
        received: id
      });
    }
    
    console.log(`🔍 Accès à la candidature ${id} par ${req.user._id} (${req.user.role})`);
    next();
  },
  applicationController.getApplicationById
);

// 🚫 Middleware pour les routes non trouvées spécifiques aux applications
router.use('/*catchall', (req, res) => {
  res.status(404).json({
    error: 'Application route not found',
    message: `Route ${req.originalUrl} non trouvée dans le module applications`,
    availableRoutes: [
      'POST /api/applications',
      'GET /api/applications/me',
      'GET /api/applications/etudiant/:studentId',
      'GET /api/applications/all',
      'GET /api/applications/:id',
      'PUT /api/applications/me/:id',
      'DELETE /api/applications/me/:id',
      'PATCH /api/applications/:id/status'
    ],
    suggestion: 'Vérifiez l\'URL et la méthode HTTP'
  });
});

module.exports = router;
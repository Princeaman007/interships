const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 🏥 Route de santé pour les utilisateurs
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Users API',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/users/me - Mon profil',
      'PUT /api/users/me - Mettre à jour mon profil',
      'PUT /api/users/change-password - Changer mon mot de passe',
      'DELETE /api/users/avatar - Supprimer mon avatar',
      'GET /api/users/all - Tous les utilisateurs (Admin)',
      'GET /api/users/:id - Profil d\'un utilisateur (Admin)',
      'PUT /api/users/:id/role - Modifier le rôle (Admin)',
      'DELETE /api/users/:id - Supprimer un utilisateur (Admin)'
    ]
  });
});

// 👤 Route pour récupérer le profil utilisateur
router.get('/me', 
  protect, 
  (req, res, next) => {
    console.log(`👤 Utilisateur ${req.user._id} accède à son profil`);
    next();
  },
  userController.getProfile
);

// ✏️ Route pour mettre à jour le profil avec upload d'avatar
router.put('/me', 
  protect,
  (req, res, next) => {
    console.log(`✏️ Utilisateur ${req.user._id} met à jour son profil`);
    // 🔧 FIX: Vérifier que req.body existe avant Object.keys
    if (req.body && typeof req.body === 'object') {
      console.log('📦 Body reçu:', Object.keys(req.body));
    } else {
      console.log('📦 Body reçu: FormData ou vide');
    }
    next();
  },
  userController.uploadAvatar, // Middleware d'upload
  (req, res, next) => {
    // Middleware pour vérifier l'upload après multer
    if (req.file) {
      console.log(`📁 Fichier uploadé: ${req.file.filename} (${req.file.size} bytes)`);
    }
    // 🔧 FIX: Maintenant req.body devrait être disponible après multer
    if (req.body && typeof req.body === 'object') {
      console.log('📦 Body après multer:', Object.keys(req.body));
    }
    next();
  },
  userController.updateProfile
);

// 🔑 Route pour changer le mot de passe
router.put('/change-password', 
  protect, 
  (req, res, next) => {
    console.log(`🔑 Utilisateur ${req.user._id} change son mot de passe`);
    next();
  },
  userController.changePassword
);

// 🗑️ Route pour supprimer l'avatar
router.delete('/avatar', 
  protect, 
  (req, res, next) => {
    console.log(`🗑️ Utilisateur ${req.user._id} supprime son avatar`);
    next();
  },
  userController.deleteAvatar
);

// 👨‍💼 Routes d'administration
router.get('/all', 
  protect, 
  isAdmin, 
  (req, res, next) => {
    console.log(`👨‍💼 Admin ${req.user._id} accède à la liste des utilisateurs`);
    next();
  },
  userController.getAllUsers
);

router.get('/:id', 
  protect, 
  isAdmin,
  (req, res, next) => {
    const { id } = req.params;
    
    // Vérifier que l'ID est valide
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
        message: 'L\'ID utilisateur doit être un ObjectId MongoDB valide',
        received: id
      });
    }
    
    console.log(`👨‍💼 Admin ${req.user._id} accède au profil de l'utilisateur ${id}`);
    next();
  },
  userController.getUserById
);

router.put('/:id/role', 
  protect, 
  isAdmin,
  (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validation de l'ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
        message: 'L\'ID utilisateur doit être un ObjectId MongoDB valide',
        received: id
      });
    }
    
    // Validation du rôle
    const allowedRoles = ['étudiant', 'admin', 'company'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Le rôle doit être: étudiant, admin, ou company',
        received: role,
        allowedValues: allowedRoles
      });
    }
    
    console.log(`👨‍💼 Admin ${req.user._id} change le rôle de ${id} vers "${role}"`);
    next();
  },
  userController.updateUserRole
);

router.delete('/:id', 
  protect, 
  isAdmin,
  (req, res, next) => {
    const { id } = req.params;
    
    // Vérifier que l'ID est valide
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
        message: 'L\'ID utilisateur doit être un ObjectId MongoDB valide',
        received: id
      });
    }
    
    // Empêcher l'admin de se supprimer lui-même
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot delete yourself',
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    console.log(`👨‍💼 Admin ${req.user._id} supprime l'utilisateur ${id}`);
    next();
  },
  userController.deleteUser
);

// 📊 Route pour les statistiques utilisateurs (Admin)
router.get('/stats/overview', 
  protect, 
  isAdmin,
  (req, res, next) => {
    console.log(`📊 Admin ${req.user._id} accède aux statistiques utilisateurs`);
    next();
  },
  userController.getUserStats
);

// 🚫 Middleware pour les routes non trouvées spécifiques aux utilisateurs
router.use('/*catchall', (req, res) => {
  res.status(404).json({
    error: 'User route not found',
    message: `Route ${req.originalUrl} non trouvée dans le module utilisateurs`,
    availableRoutes: [
      'GET /api/users/me',
      'PUT /api/users/me',
      'PUT /api/users/change-password',
      'DELETE /api/users/avatar',
      'GET /api/users/all',
      'GET /api/users/stats/overview',
      'GET /api/users/:id',
      'PUT /api/users/:id/role',
      'DELETE /api/users/:id'
    ],
    suggestion: 'Vérifiez l\'URL et la méthode HTTP'
  });
});

module.exports = router;
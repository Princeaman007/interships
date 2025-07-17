const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Assurez-vous d'importer le modèle User

// Configuration Multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars/';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: function (req, file, cb) {
    // Vérifier que c'est une image
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (JPG, PNG, GIF, WebP)'), false);
    }
  }
});

// 👤 Récupérer le profil de l'utilisateur connecté
exports.getProfile = (req, res) => {
  try {
    console.log(`👤 Récupération du profil pour l'utilisateur ${req.user._id}`);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Utilisateur non authentifié' 
      });
    }

    // Construire l'URL complète de l'avatar
    let avatarUrl = req.user.avatar || req.user.profile?.avatarUrl;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;
    }

    const profileData = {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      gender: req.user.gender,
      email: req.user.email,
      role: req.user.role,
      avatar: avatarUrl,
      profile: req.user.profile,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

// Middleware pour l'upload d'avatar
exports.uploadAvatar = upload.single('avatar');

// ✏️ Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    console.log('✏️ updateProfile - Body:', req.body);
    console.log('✏️ updateProfile - File:', req.file);
    console.log('✏️ updateProfile - User ID:', req.user._id);
    
    const { firstName, lastName, email, country, phone, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé.' 
      });
    }

    // Mettre à jour les informations de base
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    
    if (email && email !== user.email) {
      // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
      const emailExists = await User.findOne({ 
        email: email, 
        _id: { $ne: req.user._id } 
      });
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Cet email est déjà utilisé.' 
        });
      }
      user.email = email.trim().toLowerCase();
    }

    // Mettre à jour le mot de passe si fourni
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères.' 
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    // Gérer l'avatar uploadé
    if (req.file) {
      // Supprimer l'ancien avatar s'il existe
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
            console.log('🗑️ Ancien avatar supprimé:', oldAvatarPath);
          } catch (err) {
            console.error('Erreur lors de la suppression de l\'ancien avatar:', err);
          }
        }
      }
      
      // Construire l'URL de l'avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarUrl;
      
      // Aussi mettre à jour dans profile pour compatibilité
      if (!user.profile) user.profile = {};
      user.profile.avatarUrl = avatarUrl;
      
      console.log('📁 updateProfile - Nouvel avatar:', avatarUrl);
    }

    // Mettre à jour les informations du profil
    if (!user.profile) user.profile = {};
    if (country) user.profile.country = country.trim();
    if (phone) user.profile.phone = phone.trim();

    // Mettre à jour la date de modification
    user.updatedAt = new Date();
    
    await user.save();

    // Construire l'URL complète de l'avatar pour la réponse
    let fullAvatarUrl = user.avatar;
    if (fullAvatarUrl && !fullAvatarUrl.startsWith('http')) {
      fullAvatarUrl = `${req.protocol}://${req.get('host')}${fullAvatarUrl}`;
    }

    // Retourner l'utilisateur mis à jour
    const updatedUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: fullAvatarUrl,
      profile: user.profile,
      updatedAt: user.updatedAt
    };

    console.log('✅ updateProfile - Utilisateur mis à jour:', updatedUser);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });
    
  } catch (err) {
    console.error('❌ updateProfile - Erreur:', err);
    
    // Gestion d'erreur spécifique pour multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: 'Le fichier est trop volumineux (max 5MB).' 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'Erreur lors de l\'upload du fichier.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil.',
      error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error'
    });
  }
};

// 🔑 Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    console.log(`🔑 Changement de mot de passe pour l'utilisateur ${req.user._id}`);
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis.' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé.' 
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Mot de passe actuel incorrect.' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Le nouveau mot de passe doit être différent de l\'ancien.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    console.log(`✅ Mot de passe changé avec succès pour ${user.email}`);

    res.status(200).json({ 
      success: true,
      message: 'Mot de passe mis à jour avec succès.' 
    });
  } catch (err) {
    console.error('❌ changePassword - Erreur:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur.',
      error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error'
    });
  }
};

// 🗑️ Supprimer l'avatar
exports.deleteAvatar = async (req, res) => {
  try {
    console.log(`🗑️ Suppression de l'avatar pour l'utilisateur ${req.user._id}`);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé.' 
      });
    }

    // Supprimer le fichier avatar s'il existe
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log(`🗑️ Fichier avatar supprimé: ${avatarPath}`);
        } catch (err) {
          console.error('Erreur lors de la suppression du fichier avatar:', err);
        }
      }
    }

    // Supprimer l'avatar de la base de données
    user.avatar = null;
    if (user.profile) {
      user.profile.avatarUrl = null;
    }
    user.updatedAt = new Date();

    await user.save();

    console.log(`✅ Avatar supprimé avec succès pour ${user.email}`);

    res.status(200).json({ 
      success: true,
      message: 'Avatar supprimé avec succès.' 
    });
  } catch (err) {
    console.error('❌ deleteAvatar - Erreur:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'avatar.',
      error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error'
    });
  }
};

// 📋 Récupérer tous les utilisateurs (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    console.log(`📋 Admin ${req.user._id} récupère tous les utilisateurs`);
    
    // Construction des filtres
    const filters = {};
    
    if (role && ['étudiant', 'admin', 'company'].includes(role)) {
      filters.role = role;
    }
    
    let query = User.find(filters)
      .select('-password') // Exclure le mot de passe
      .sort({ createdAt: -1 });
    
    // Recherche par nom ou email
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]);
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));
    
    const users = await query;
    const total = await User.countDocuments(filters);
    
    // Statistiques par rôle
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const stats = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      roleBreakdown: roleStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
    
    // Construire les URLs complètes des avatars
    const usersWithFullAvatarUrls = users.map(user => {
      let avatarUrl = user.avatar;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;
      }
      return {
        ...user.toObject(),
        avatar: avatarUrl
      };
    });
    
    res.status(200).json({
      success: true,
      stats,
      count: users.length,
      data: usersWithFullAvatarUrls
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

// 👤 Récupérer un utilisateur par ID (Admin)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`👤 Admin ${req.user._id} récupère l'utilisateur ${id}`);
    
    const user = await User.findById(id)
      .select('-password'); // Exclure le mot de passe
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Construire l'URL complète de l'avatar
    let avatarUrl = user.avatar;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: avatarUrl,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

// 🔄 Modifier le rôle d'un utilisateur (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log(`🔄 Admin ${req.user._id} modifie le rôle de ${id} vers ${role}`);
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const oldRole = user.role;
    user.role = role;
    user.updatedAt = new Date();
    await user.save();
    
    console.log(`✅ Rôle de ${user.email} changé de ${oldRole} vers ${role}`);
    
    res.status(200).json({
      success: true,
      message: `Rôle mis à jour de "${oldRole}" vers "${role}"`,
      data: {
        id: user._id,
        email: user.email,
        oldRole,
        newRole: role,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur updateUserRole:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rôle',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

// 🗑️ Supprimer un utilisateur (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Admin ${req.user._id} supprime l'utilisateur ${id}`);
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Supprimer l'avatar s'il existe
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log(`🗑️ Avatar supprimé: ${avatarPath}`);
        } catch (err) {
          console.error('Erreur lors de la suppression de l\'avatar:', err);
        }
      }
    }
    
    // TODO: Supprimer aussi les candidatures de cet utilisateur
    // const Application = require('../models/Application');
    // await Application.deleteMany({ applicant: id });
    
    const deletedUserInfo = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    await User.findByIdAndDelete(id);
    
    console.log(`✅ Utilisateur ${deletedUserInfo.email} supprimé avec succès`);
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      deletedUser: deletedUserInfo
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

// 📊 Statistiques des utilisateurs (Admin)
exports.getUserStats = async (req, res) => {
  try {
    console.log(`📊 Admin ${req.user._id} génère les statistiques utilisateurs`);
    
    // Statistiques globales
    const totalUsers = await User.countDocuments();
    
    // Répartition par rôle
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Nouveaux utilisateurs par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Utilisateurs avec avatar
    const usersWithAvatar = await User.countDocuments({ avatar: { $ne: null } });
    
    // Utilisateurs actifs (connectés dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    const stats = {
      global: {
        totalUsers,
        activeUsers,
        usersWithAvatar,
        avatarPercentage: totalUsers > 0 ? Math.round((usersWithAvatar / totalUsers) * 100) : 0,
        activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      byRole: roleStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      monthlyGrowth: monthlyStats.map(stat => ({
        month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
        newUsers: stat.count
      })),
      generatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Erreur getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};
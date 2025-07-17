const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔒 Middleware pour vérifier le token JWT
exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

exports.isétudiant = (req, res, next) => {
  if (req.user?.role === 'étudiant') {
    return next();
  }
  return res.status(403).json({ message: 'Accès réservé aux étudiants.' });
};


// 🛡️ Middleware pour rôle admin (admin ou superAdmin)
exports.isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'superAdmin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
};

// 🛡️ Middleware pour rôle superAdmin uniquement
exports.isSuperAdmin = (req, res, next) => {
  if (req.user?.role === 'superAdmin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès réservé au super administrateur.' });
};

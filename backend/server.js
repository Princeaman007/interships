const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// 📁 Importation des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const offerRoutes = require('./routes/offerRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
console.log('✅ EMAIL_USER:', process.env.EMAIL_USER);
console.log('✅ EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ present' : '❌ missing');

connectDB(); // 🔌 Connexion MongoDB

const app = express(); // ✅ d'abord on initialise app !

// 🛡️ Middlewares de base
app.use(cors({
  origin: 'http://localhost:5173', // ← adapte si frontend change
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Augmenté pour les uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔍 Middleware de debugging (uniquement en développement)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Body:', req.body);
    }
    if (req.file) {
      console.log('📁 File:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    }
    next();
  });
}

// 📦 Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🏥 Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    routes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users/me',
      'PUT /api/users/me',
      'PUT /api/users/change-password',
      'DELETE /api/users/avatar',
      'GET /api/applications/etudiant/:studentId',
      'POST /api/applications',
      'GET /api/internships',
      'GET /api/offers',
      // Ajoutez d'autres routes importantes ici
    ]
  });
});

// 📦 Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/admin', adminRoutes);

// 🚫 Gestion 404 - DOIT être après toutes les routes
app.use((req, res, next) => {
  const errorMessage = `Route not found: ${req.method} ${req.originalUrl}`;
  console.log(`❌ 404 - ${errorMessage}`);
  
  // Suggérer des routes similaires
  const availableRoutes = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/users/me',
    '/api/applications/etudiant/:id',
    '/api/internships',
    '/api/offers'
  ];
  
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    message: errorMessage,
    suggestion: 'Check the available routes below',
    availableRoutes: availableRoutes,
    timestamp: new Date().toISOString()
  });
});

// 💥 Gestion des erreurs 500 - DOIT être en dernier
app.use((err, req, res, next) => {
  console.error(`💥 500 Error on ${req.method} ${req.originalUrl}:`);
  console.error('Error details:', err);
  
  // Ne pas exposer les détails d'erreur en production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Gestion spécifique pour les erreurs Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Le fichier est trop volumineux (max 5MB)',
      maxSize: '5MB'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      message: 'Trop de fichiers uploadés'
    });
  }
  
  // Erreurs de validation MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: errors.join(', '),
      fields: Object.keys(err.errors)
    });
  }
  
  // Erreur de duplication MongoDB (email déjà utilisé, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} is already in use`,
      field: field
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Token invalide'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Token expiré, veuillez vous reconnecter'
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { 
      stack: err.stack,
      details: err 
    })
  });
});

// 🚀 Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📂 Static files: http://localhost:${PORT}/uploads/`);
  console.log('📡 Available routes:');
  console.log('   🔐 POST /api/auth/login');
  console.log('   📝 POST /api/auth/register');
  console.log('   👤 GET  /api/users/me');
  console.log('   ✏️  PUT  /api/users/me');
  console.log('   🔑 PUT  /api/users/change-password');
  console.log('   🗑️  DELETE /api/users/avatar');
  console.log('   📄 GET  /api/applications/etudiant/:id');
  console.log('   💼 GET  /api/internships');
  console.log('   🎯 GET  /api/offers');
});

module.exports = app;
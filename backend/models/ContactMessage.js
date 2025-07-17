const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  lang: {
    type: String,
    enum: ['fr', 'en'],
    required: true
  },

  // ✅ Partie réponse admin (facultative)
  reply: {
    type: String // Réponse écrite par l’admin
  },

  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  repliedAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

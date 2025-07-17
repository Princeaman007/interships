const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  translations: {
    fr: {
      content: { type: String, required: true }
    },
    en: {
      content: { type: String, required: true }
    }
  },

  authorName: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['étudiant', 'admin'],
    required: true
  },

  country: {
    type: String,
    required: true
  },

  avatarUrl: {
    type: String // facultatif
  },

  approved: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);

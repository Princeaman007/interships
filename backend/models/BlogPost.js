const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },

  translations: {
    fr: {
      title: { type: String, required: true },
      summary: { type: String, required: true },
      content: { type: String, required: true }
    },
    en: {
      title: { type: String, required: true },
      summary: { type: String, required: true },
      content: { type: String, required: true }
    }
  },

  imageUrl: {
    type: String // URL vers une image (optionnelle)
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  publishedAt: {
    type: Date,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BlogPost', blogPostSchema);

const mongoose = require('mongoose');

const aboutPageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    enum: ['why-hire', 'how-it-works', 'submit-offer']
  },

  translations: {
    fr: {
      title: { type: String, required: true },
      content: { type: String, required: true }
    },
    en: {
      title: { type: String, required: true },
      content: { type: String, required: true }
    }
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AboutPage', aboutPageSchema);

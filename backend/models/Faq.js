const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  translations: {
    fr: {
      question: { type: String, required: true },
      answer: { type: String, required: true }
    },
    en: {
      question: { type: String, required: true },
      answer: { type: String, required: true }
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Faq', faqSchema);

const mongoose = require('mongoose');

const servicePageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    enum: ['internship-search', 'housing', 'airport-pickup', 'support']
  },

  icon: {
    type: String // ex: "fa-house-user" (si utilisé sur frontend)
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

  pricingTable: {
    type: [mongoose.Schema.Types.Mixed], // tableau libre, présent uniquement si utile
    default: undefined
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServicePage', servicePageSchema);

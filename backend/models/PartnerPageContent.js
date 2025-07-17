const mongoose = require('mongoose');

const partnerPageContentSchema = new mongoose.Schema({
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
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PartnerPageContent', partnerPageContentSchema);

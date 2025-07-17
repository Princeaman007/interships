const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  translations: {
    fr: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      location: { type: String }
    },
    en: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      location: { type: String }
    }
  },
  field: { type: String, required: true }, // domaine : IT, finance, etc.
  country: { type: String, required: true },
  type: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    required: true
  },
  duration: { type: String },
  salary: { type: String },
  image: { type: String, default: '' }, // 🆕 image ou logo de l'offre
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Internship', internshipSchema);

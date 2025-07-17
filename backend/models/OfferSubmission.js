const mongoose = require('mongoose');

const offerSubmissionSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  position: { type: String, required: true },
  description: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OfferSubmission', offerSubmissionSchema);

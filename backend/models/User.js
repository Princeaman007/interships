
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
 gender: {
  type: String,
  enum: ['male', 'female', 'other'], // ✅ pour que "male" soit accepté
  required: true
}
,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['étudiant', 'admin', 'superAdmin'],
    default: 'étudiant'
  },
  profile: {
    country: String,
    phone: String,
    avatarUrl: String,  
    cvUrl: String,
    motivationLetterUrl: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
    emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date
});

module.exports = mongoose.model('User', userSchema);

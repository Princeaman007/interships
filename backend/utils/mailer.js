require('dotenv').config();
const nodemailer = require('nodemailer');

// 🔍 Debug des variables d'environnement
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  authMethod: 'LOGIN' // ✅ important avec Gmail
});

const sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `"Plateforme Stage" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;

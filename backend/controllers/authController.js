const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const { t } = require('../utils/i18n'); 


const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

    try {
        const { firstName, lastName, gender, email, password, country, phone } = req.body;

        // Vérifie si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: t('auth.email_exists', lang) });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Génération du token de vérification
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expire dans 24h

        // Création du nouvel utilisateur
        const newUser = new User({
            firstName,
            lastName,
            gender,
            email,
            password: hashedPassword,
            profile: {
                country,
                phone
            },
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires
        });

        await newUser.save();
        const verifyUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

        const html = `
  <h3>Bienvenue ${firstName},</h3>
  <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
  <a href="${verifyUrl}">Confirmer mon adresse</a>
  <p>Ce lien expirera dans 24 heures.</p>
`;

        await sendEmail(email, 'Confirmation de votre adresse email', html);


        // TODO: Envoi de l'email avec le lien de vérification ici

        res.status(201).json({
            message: t('auth.register_success', lang)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: t('auth.server_error', lang) || 'Erreur serveur.' });
    }
};

exports.login = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: t('auth.invalid_credentials', lang) });
    }

    // Vérifie si l’email a été confirmé
    if (!user.emailVerified) {
      return res.status(401).json({
        message: t('auth.email_not_verified', lang) || 'Veuillez vérifier votre adresse email.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: t('auth.invalid_credentials', lang) });
    }

    // 🔐 Génération des tokens
    const payload = { id: user._id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

    // Envoi du refresh token dans un cookie sécurisé
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.status(200).json({
      message: t('auth.login_success', lang),
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: t('auth.server_error', lang) });
  }
};



exports.refreshToken = async (req, res) => {
    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: t('auth.unauthorized', lang) });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({ accessToken });
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: t('auth.invalid_token', lang) });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({ message: t('auth.logout_success', req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr') });
};

exports.verifyEmail = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: 'Token manquant.' });
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // vérifie expiration
    });

    if (!user) {
      return res.status(400).json({ message: 'Lien invalide ou expiré.' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Email vérifié avec succès.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

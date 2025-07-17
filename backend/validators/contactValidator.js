const { body } = require('express-validator');

exports.createContactMessageValidator = [
  body('fullName')
    .notEmpty().withMessage('Le nom complet est requis.')
    .isLength({ max: 100 }).withMessage('Le nom est trop long.'),

  body('email')
    .notEmpty().withMessage('L’email est requis.')
    .isEmail().withMessage('Email invalide.'),

  body('subject')
    .notEmpty().withMessage('Le sujet est requis.')
    .isLength({ max: 150 }).withMessage('Le sujet est trop long.'),

  body('message')
    .notEmpty().withMessage('Le message est requis.')
    .isLength({ max: 2000 }).withMessage('Le message est trop long (max 2000 caractères).')
];

exports.replyToContactValidator = [
  body('reply')
    .notEmpty().withMessage('La réponse est requise.')
    .isLength({ max: 2000 }).withMessage('La réponse est trop longue (max 2000 caractères).')
];

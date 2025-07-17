const { body } = require('express-validator');

exports.createPartnerRequestValidator = [
  body('companyName')
    .notEmpty().withMessage('Le nom de l’entreprise est requis.')
    .isLength({ max: 100 }).withMessage('Le nom de l’entreprise est trop long.'),

  body('contactPerson')
    .notEmpty().withMessage('Le nom du contact est requis.')
    .isLength({ max: 100 }).withMessage('Le nom du contact est trop long.'),

  body('email')
    .notEmpty().withMessage('L’email est requis.')
    .isEmail().withMessage('Email invalide.'),

  body('phone')
    .optional()
    .isLength({ max: 30 }).withMessage('Le téléphone est trop long.'),

  body('message')
    .notEmpty().withMessage('Le message est requis.')
    .isLength({ max: 2000 }).withMessage('Le message est trop long.')
];

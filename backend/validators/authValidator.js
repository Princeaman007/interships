const { body } = require('express-validator');

exports.registerValidator = [
  body('firstName')
    .notEmpty().withMessage('Le prénom est requis.')
    .isLength({ max: 50 }).withMessage('Le prénom est trop long.'),

  body('lastName')
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ max: 50 }).withMessage('Le nom est trop long.'),

  body('gender')
    .notEmpty().withMessage('Le genre est requis.')
    .isIn(['male', 'female', 'other']).withMessage('Genre invalide.'),

  body('email')
    .notEmpty().withMessage('L’email est requis.')
    .isEmail().withMessage('Email invalide.'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),

  body('country')
    .notEmpty().withMessage('Le pays est requis.'),

  body('phone')
    .notEmpty().withMessage('Le téléphone est requis.')
];

exports.loginValidator = [
  body('email')
    .notEmpty().withMessage('L’email est requis.')
    .isEmail().withMessage('Email invalide.'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
];

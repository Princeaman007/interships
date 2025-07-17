const { body } = require('express-validator');

exports.createTestimonialValidator = [
  body('translations.fr.content')
    .notEmpty().withMessage('Le témoignage en français est requis.'),

  body('translations.en.content')
    .notEmpty().withMessage('Le témoignage en anglais est requis.'),

  body('authorName')
    .notEmpty().withMessage("Le nom de l’auteur est requis."),

  body('role')
    .notEmpty().withMessage('Le rôle est requis.')
    .isIn(['étudiant', 'admin']).withMessage('Rôle invalide.'),

  body('country')
    .notEmpty().withMessage('Le pays est requis.')
];

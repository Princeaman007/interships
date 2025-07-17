const { body } = require('express-validator');

exports.blogPostValidator = [
  body('translations.fr.title')
    .notEmpty().withMessage('Le titre en français est requis.'),

  body('translations.fr.content')
    .notEmpty().withMessage('Le contenu en français est requis.'),

  body('translations.en.title')
    .notEmpty().withMessage('Le titre en anglais est requis.'),

  body('translations.en.content')
    .notEmpty().withMessage('Le contenu en anglais est requis.'),

  body('publishedAt')
    .optional()
    .isISO8601().withMessage('La date de publication est invalide.')
];

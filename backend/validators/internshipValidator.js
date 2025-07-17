const { body } = require('express-validator');

exports.createInternshipValidator = [
  // Champs multilingues requis
  body('translations.fr.title')
    .notEmpty().withMessage('Le titre en français est requis.'),

  body('translations.fr.description')
    .notEmpty().withMessage('La description en français est requise.'),

  body('translations.en.title')
    .notEmpty().withMessage('Le titre en anglais est requis.'),

  body('translations.en.description')
    .notEmpty().withMessage('La description en anglais est requise.'),

  // Lieu dans la traduction (facultatif globalement, mais à valider si fourni)
  body('translations.fr.location')
    .optional().isString().withMessage('Le lieu (FR) doit être une chaîne.'),

  body('translations.en.location')
    .optional().isString().withMessage('Le lieu (EN) doit être une chaîne.'),

  // Champs obligatoires
  body('translations.fr.location')
  .notEmpty().withMessage('Le lieu du stage (FR) est requis.'),

body('translations.en.location')
  .notEmpty().withMessage('Le lieu du stage (EN) est requis.'),


  body('field')
    .notEmpty().withMessage('Le domaine du stage est requis.'),

  body('country')
    .notEmpty().withMessage('Le pays est requis.'),

  body('duration')
    .notEmpty().withMessage('La durée du stage est requise.'),

  body('type')
    .notEmpty().withMessage('Le type de stage est requis.')
    .isIn(['remote', 'on-site', 'hybrid']).withMessage('Type invalide.'),

  // Dates
  body('startDate')
    .notEmpty().withMessage('La date de début est requise.')
    .isISO8601().withMessage('Format de date invalide pour la date de début.'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Format de date invalide pour la date de fin.'),

  // Salaire optionnel
  body('salary')
    .optional()
    .isString().withMessage('Le salaire doit être une chaîne.')
];

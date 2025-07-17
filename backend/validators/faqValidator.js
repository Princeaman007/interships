const { body } = require('express-validator');

exports.faqValidator = [
  body('translations.fr.question')
    .notEmpty().withMessage('La question en français est requise.'),

  body('translations.fr.answer')
    .notEmpty().withMessage('La réponse en français est requise.'),

  body('translations.en.question')
    .notEmpty().withMessage('La question en anglais est requise.'),

  body('translations.en.answer')
    .notEmpty().withMessage('La réponse en anglais est requise.')
];

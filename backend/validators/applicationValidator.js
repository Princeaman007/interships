const { body } = require('express-validator');

exports.createApplicationValidator = [
  body('internship')
    .notEmpty().withMessage("L'ID du stage est requis.")
    .isMongoId().withMessage("ID de stage invalide."),

  body('message')
    .optional()
    .isLength({ max: 1000 }).withMessage('Le message est trop long (maximum 1000 caractères).')
];

exports.updateApplicationValidator = [
  body('message')
    .notEmpty().withMessage('Le message est requis.')
    .isLength({ max: 1000 }).withMessage('Le message est trop long.')
];


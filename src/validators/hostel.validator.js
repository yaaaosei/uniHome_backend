const { body } = require('express-validator');

const createHostelRules = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array of strings.'),
  body('images').optional().isArray().withMessage('Images must be an array of URL strings.'),
  body('availability')
    .optional()
    .isIn(['available', 'occupied', 'reserved'])
    .withMessage('Availability must be available, occupied, or reserved.'),
];

module.exports = {
  createHostelRules,
};

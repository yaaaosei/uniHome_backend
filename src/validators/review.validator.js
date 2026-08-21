const { body } = require('express-validator');

const createReviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
  body('comment').trim().notEmpty().withMessage('Comment is required.'),
];

module.exports = {
  createReviewRules,
};

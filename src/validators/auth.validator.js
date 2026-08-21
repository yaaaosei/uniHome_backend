const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email address is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('role')
    .optional()
    .isIn(['student', 'landlord', 'admin'])
    .withMessage('Role must be either student, landlord, or admin.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = {
  registerRules,
  loginRules,
};

const { body } = require('express-validator');

const createBookingRules = [
  body('hostelId').isMongoId().withMessage('Valid hostelId is required.'),
  body('date').notEmpty().withMessage('Viewing date is required.'),
  body('time').notEmpty().withMessage('Viewing time is required.'),
];

const updateBookingStatusRules = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'cancelled'])
    .withMessage('Status must be pending, approved, rejected, or cancelled.'),
];

module.exports = {
  createBookingRules,
  updateBookingStatusRules,
};

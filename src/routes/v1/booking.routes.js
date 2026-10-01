const express = require('express');
const {
  requestBooking,
  listUserBookings,
  updateBookingStatus,
  cancelBooking,
} = require('../../controllers/booking.controller');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  createBookingRules,
  updateBookingStatusRules,
} = require('../../validators/booking.validator');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('student', 'admin'),
  createBookingRules,
  validate,
  requestBooking
);
router.get('/', protect, listUserBookings);
router.patch(
  '/:id/status',
  protect,
  updateBookingStatusRules,
  validate,
  updateBookingStatus
);
router.delete('/:id', protect, cancelBooking);

module.exports = router;

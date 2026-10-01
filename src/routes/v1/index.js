const express = require('express');
const authRoutes = require('./auth.routes');
const hostelRoutes = require('./hostel.routes');
const bookingRoutes = require('./booking.routes');
const favoriteRoutes = require('./favorite.routes');
const recommendationRoutes = require('./recommendation.routes');
const reviewRoutes = require('./review.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/hostels', hostelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;

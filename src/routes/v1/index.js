const express = require('express');
const authRoutes = require('./auth.routes');
const hostelRoutes = require('./hostel.routes');
const bookingRoutes = require('./booking.routes');
const favoriteRoutes = require('./favorite.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/hostels', hostelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;

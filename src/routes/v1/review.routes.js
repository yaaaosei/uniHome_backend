const express = require('express');
const { getUserReviews } = require('../../controllers/review.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', protect, getUserReviews);

module.exports = router;

const express = require('express');
const {
  searchHostels,
  getFilterMetadata,
  getHostelById,
  createHostel,
} = require('../../controllers/hostel.controller');
const {
  getReviewsForHostel,
  postReview,
} = require('../../controllers/review.controller');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createHostelRules } = require('../../validators/hostel.validator');
const { createReviewRules } = require('../../validators/review.validator');

const router = express.Router();

router.get('/', searchHostels);
router.get('/metadata/filters', getFilterMetadata);
router.get('/:id', getHostelById);
router.post(
  '/',
  protect,
  authorize('landlord', 'admin'),
  createHostelRules,
  validate,
  createHostel
);

// Review nested endpoints
router.get('/:id/reviews', getReviewsForHostel);
router.post(
  '/:id/reviews',
  protect,
  authorize('student', 'admin'),
  createReviewRules,
  validate,
  postReview
);

module.exports = router;

const express = require('express');
const {
  listFavorites,
  addFavorite,
  removeFavorite,
} = require('../../controllers/favorite.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('student', 'admin'), listFavorites);
router.post('/:hostelId', protect, authorize('student', 'admin'), addFavorite);
router.delete(
  '/:hostelId',
  protect,
  authorize('student', 'admin'),
  removeFavorite
);

module.exports = router;

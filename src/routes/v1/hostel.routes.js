const express = require('express');
const {
  searchHostels,
  getFilterMetadata,
  getHostelById,
  createHostel,
  updateAvailability,
} = require('../../controllers/hostel.controller');
const {
  getReviewsForHostel,
  postReview,
} = require('../../controllers/review.controller');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createHostelRules } = require('../../validators/hostel.validator');
const { createReviewRules } = require('../../validators/review.validator');

const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../uploads/hostels/')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `hostel-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const mimeValid = allowed.test(file.mimetype);
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mimeValid && extValid) return cb(null, true);
    cb(new Error('Invalid image file type. Only PNG, JPG, JPEG, and WEBP are permitted.'));
  }
});

router.get('/', searchHostels);
router.get('/metadata/filters', getFilterMetadata);

// Image upload route
router.post('/upload', protect, authorize('landlord', 'admin'), upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'No files were uploaded.' });
  }
  const fileUrls = req.files.map(file => `/uploads/hostels/${file.filename}`);
  res.status(200).json({ success: true, urls: fileUrls });
});

router.get('/:id', getHostelById);
router.post(
  '/',
  protect,
  authorize('landlord', 'admin'),
  createHostelRules,
  validate,
  createHostel
);

router.patch(
  '/:id/availability',
  protect,
  authorize('landlord', 'admin'),
  updateAvailability
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

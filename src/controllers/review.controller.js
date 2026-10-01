const Review = require('../models/Review');
const Hostel = require('../models/Hostel');

// @desc    Get reviews for a hostel
// @route   GET /api/v1/hostels/:id/reviews
// @access  Public
const getReviewsForHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Hostel with ID '${req.params.id}' was not found.`,
      });
    }

    const reviews = await Review.find({ hostelId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const formatted = reviews.map((review) => {
      const json = review.toJSON();
      json.userName = review.userId ? review.userId.name : 'Anonymous';
      json.userId = review.userId ? review.userId._id.toString() : json.userId;
      json.createdAt = review.createdAt
        ? review.createdAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return json;
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Post a review for a hostel
// @route   POST /api/v1/hostels/:id/reviews
// @access  Private (Student)
const postReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const hostelId = req.params.id;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Hostel with ID '${hostelId}' was not found.`,
      });
    }

    const review = await Review.create({
      hostelId,
      userId: req.user._id,
      rating,
      comment,
    });

    await review.populate('userId', 'name');
    const json = review.toJSON();
    json.userName = req.user.name;
    json.createdAt = review.createdAt
      ? review.createdAt.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return res.status(201).json(json);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews submitted by current user
// @route   GET /api/v1/reviews/me
// @access  Private
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('hostelId', 'title')
      .sort({ createdAt: -1 });

    const formatted = reviews.map((review) => {
      const json = review.toJSON();
      json.userName = req.user.name;
      json.hostelTitle = review.hostelId ? review.hostelId.title : 'Hostel';
      json.createdAt = review.createdAt
        ? review.createdAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return json;
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsForHostel,
  postReview,
  getUserReviews,
};

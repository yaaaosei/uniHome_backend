const Favorite = require('../models/Favorite');
const Hostel = require('../models/Hostel');

// @desc    List favorite hostels for authenticated user
// @route   GET /api/v1/favorites
// @access  Private (Student)
const listFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).populate({
      path: 'hostelId',
      populate: { path: 'landlordId', select: 'name email' },
    });

    const hostels = favorites
      .filter((fav) => fav.hostelId !== null)
      .map((fav) => {
        const hostel = fav.hostelId;
        const json = hostel.toJSON();
        if (hostel.landlordId) {
          json.landlordName = hostel.landlordId.name;
          json.landlordId = hostel.landlordId._id.toString();
        }
        return json;
      });

    return res.status(200).json(hostels);
  } catch (error) {
    next(error);
  }
};

// @desc    Save hostel to favorites
// @route   POST /api/v1/favorites/:hostelId
// @access  Private (Student)
const addFavorite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Hostel with ID '${hostelId}' was not found.`,
      });
    }

    await Favorite.findOneAndUpdate(
      { userId: req.user._id, hostelId },
      { userId: req.user._id, hostelId },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: 'Hostel added to favorites',
      hostelId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove hostel from favorites
// @route   DELETE /api/v1/favorites/:hostelId
// @access  Private (Student)
const removeFavorite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    await Favorite.findOneAndDelete({
      userId: req.user._id,
      hostelId,
    });

    return res.status(200).json({
      message: 'Hostel removed from favorites',
      hostelId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFavorites,
  addFavorite,
  removeFavorite,
};

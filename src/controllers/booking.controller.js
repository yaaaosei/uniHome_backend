const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');

// @desc    Request viewing appointment
// @route   POST /api/v1/bookings
// @access  Private (Student)
const requestBooking = async (req, res, next) => {
  try {
    const { hostelId, date, time } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Hostel with ID '${hostelId}' was not found.`,
      });
    }

    const booking = await Booking.create({
      hostelId,
      userId: req.user._id,
      date,
      time,
      status: 'pending',
    });

    const json = booking.toJSON();
    json.hostelTitle = hostel.title;
    json.userName = req.user.name;

    return res.status(201).json(json);
  } catch (error) {
    next(error);
  }
};

// @desc    List user bookings
// @route   GET /api/v1/bookings
// @access  Private (Student, Landlord, Admin)
const listUserBookings = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'landlord') {
      const landlordHostels = await Hostel.find({ landlordId: req.user._id }).select('_id');
      const hostelIds = landlordHostels.map((h) => h._id);
      filter.hostelId = { $in: hostelIds };
    }

    const bookings = await Booking.find(filter)
      .populate('hostelId', 'title location price images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => {
      const json = b.toJSON();
      if (b.hostelId) {
        json.hostelTitle = b.hostelId.title;
        json.hostelLocation = b.hostelId.location;
        json.hostelPrice = b.hostelId.price;
        json.hostelImage = b.hostelId.images && b.hostelId.images[0] ? b.hostelId.images[0] : null;
      }
      if (b.userId) {
        json.userName = b.userId.name;
        json.userEmail = b.userId.email;
      }
      return json;
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve / Reject / Cancel)
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private (Landlord, Admin, Owning Student)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('hostelId', 'title landlordId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Booking with ID '${req.params.id}' was not found.`,
      });
    }

    // Authorization check: Landlord (must own hostel), Student (must own booking), or Admin
    const isStudentOwner = booking.userId && booking.userId._id.toString() === req.user._id.toString();
    const isLandlordOwner =
      booking.hostelId &&
      booking.hostelId.landlordId &&
      booking.hostelId.landlordId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isLandlordOwner && !isAdmin) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You are not authorized to modify this booking status.',
      });
    }

    booking.status = status;
    await booking.save();

    const json = booking.toJSON();
    if (booking.hostelId) json.hostelTitle = booking.hostelId.title;
    if (booking.userId) json.userName = booking.userId.name;

    return res.status(200).json(json);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private (Owning Student, Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Booking with ID '${req.params.id}' was not found.`,
      });
    }

    const isStudentOwner = booking.userId && booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isAdmin) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You are not authorized to cancel this booking.',
      });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestBooking,
  listUserBookings,
  updateBookingStatus,
  cancelBooking,
};

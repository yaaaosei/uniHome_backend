const Hostel = require('../models/Hostel');

// @desc    Search & filter hostels
// @route   GET /api/v1/hostels
// @access  Public
const searchHostels = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      minPrice,
      maxPrice,
      availability,
      amenities,
      topRated,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (availability) {
      query.availability = availability;
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    if (topRated === 'true' || topRated === true) {
      query.rating = { $gte: 4.5 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Hostel.countDocuments(query);
    const hostels = await Hostel.find(query)
      .populate('landlordId', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const formattedHostels = hostels.map((hostel) => {
      const json = hostel.toJSON();
      if (hostel.landlordId) {
        json.landlordName = hostel.landlordId.name;
        json.landlordId = hostel.landlordId._id.toString();
      }
      return json;
    });

    return res.status(200).json({
      data: formattedHostels,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter metadata (distinct locations & amenities)
// @route   GET /api/v1/hostels/metadata/filters
// @access  Public
const getFilterMetadata = async (req, res, next) => {
  try {
    const locations = await Hostel.distinct('location');
    const amenities = await Hostel.distinct('amenities');

    const defaultLocations = [
      'East Legon, Accra',
      'Legon, Accra',
      'Madina, Accra',
      'Ayeduase, Kumasi',
      'Bomso, Kumasi',
      'North Ridge, Cape Coast',
    ];

    const defaultAmenities = [
      'Wi-Fi',
      'AC',
      'Security',
      'Water',
      'Electricity',
      'Kitchen',
      'Parking',
      'Gym',
      'Study Room',
      'Laundry',
      'Lounge',
    ];

    const mergedLocations = Array.from(
      new Set([...locations, ...defaultLocations])
    );
    const mergedAmenities = Array.from(
      new Set([...amenities, ...defaultAmenities])
    );

    return res.status(200).json({
      locations: mergedLocations,
      amenities: mergedAmenities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hostel details by ID
// @route   GET /api/v1/hostels/:id
// @access  Public
const getHostelById = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate(
      'landlordId',
      'name email'
    );

    if (!hostel) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Hostel with ID '${req.params.id}' was not found.`,
      });
    }

    const json = hostel.toJSON();
    if (hostel.landlordId) {
      json.landlordName = hostel.landlordId.name;
      json.landlordId = hostel.landlordId._id.toString();
    }

    return res.status(200).json(json);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hostel listing
// @route   POST /api/v1/hostels
// @access  Private (Landlord, Admin)
const createHostel = async (req, res, next) => {
  try {
    const {
      title,
      location,
      price,
      description,
      amenities,
      images,
      availability,
      coordinates,
    } = req.body;

    const hostel = await Hostel.create({
      title,
      location,
      price,
      description,
      amenities: amenities || [],
      images: images || [],
      availability: availability || 'available',
      coordinates: coordinates || { lat: null, lng: null },
      landlordId: req.user._id,
    });

    const populated = await hostel.populate('landlordId', 'name email');
    const json = populated.toJSON();
    if (populated.landlordId) {
      json.landlordName = populated.landlordId.name;
      json.landlordId = populated.landlordId._id.toString();
    }

    return res.status(201).json(json);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchHostels,
  getFilterMetadata,
  getHostelById,
  createHostel,
};

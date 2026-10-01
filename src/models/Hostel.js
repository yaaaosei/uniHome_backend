const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    rating: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    roomType: {
      type: String,
      enum: ['single', 'shared', 'any'],
      default: 'any',
    },
    genderPolicy: {
      type: String,
      enum: ['mixed', 'male-only', 'female-only'],
      default: 'mixed',
    },
    security: { type: Number, default: 0 },
    sanitation: { type: Number, default: 0 },
    internet: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

hostelSchema.index({ title: 'text', description: 'text' });
hostelSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Hostel', hostelSchema);

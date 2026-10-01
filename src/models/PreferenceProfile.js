const mongoose = require('mongoose');

const preferenceProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxBudget: { type: Number, required: true },
    roomType: { type: String, enum: ['single', 'shared', 'any'], required: true },
    requiredAmenities: { type: [String], default: [] },
    genderPolicy: { type: String, enum: ['mixed', 'male-only', 'female-only', 'any'], required: true },
    weights: {
      price: { type: Number, required: true },
      proximity: { type: Number, required: true },
      security: { type: Number, required: true },
      sanitation: { type: Number, required: true },
      internet: { type: Number, required: true },
      amenityMatch: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

preferenceProfileSchema.pre('validate', function (next) {
  const w = this.weights;
  if (w) {
    const sum = w.price + w.proximity + w.security + w.sanitation + w.internet + w.amenityMatch;
    // Account for floating point inaccuracies
    if (Math.abs(sum - 1.0) > 0.0001) {
      this.invalidate('weights', 'Weights must sum to exactly 1.');
    }
  }
  next();
});

module.exports = mongoose.model('PreferenceProfile', preferenceProfileSchema);

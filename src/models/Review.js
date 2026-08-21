const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
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

reviewSchema.statics.updateHostelRating = async function (hostelId) {
  const stats = await this.aggregate([
    { $match: { hostelId: new mongoose.Types.ObjectId(hostelId) } },
    {
      $group: {
        _id: '$hostelId',
        reviewCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Hostel').findByIdAndUpdate(hostelId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await mongoose.model('Hostel').findByIdAndUpdate(hostelId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.updateHostelRating(this.hostelId);
});

reviewSchema.post('remove', async function () {
  await this.constructor.updateHostelRating(this.hostelId);
});

module.exports = mongoose.model('Review', reviewSchema);

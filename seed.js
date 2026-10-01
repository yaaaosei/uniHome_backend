// seed.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in the environment variables.');
  process.exit(1);
}

// Import Mongoose Models
const User = require('./src/models/User');
const Hostel = require('./src/models/Hostel');
const Review = require('./src/models/Review');
const Booking = require('./src/models/Booking');

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8')
);

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing collection data
    await User.deleteMany();
    await Hostel.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();

    console.log('Old data cleared.');

    // Seed new data
    await User.insertMany(seedData.users);
    await Hostel.insertMany(seedData.hostels);
    await Review.insertMany(seedData.reviews);
    await Booking.insertMany(seedData.bookings);

    console.log('Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

importData();

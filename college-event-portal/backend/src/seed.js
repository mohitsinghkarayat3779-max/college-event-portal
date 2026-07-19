// Optional helper: creates one admin user and one sample event.
// Run with: npm run seed  (after setting up your .env)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@college.edu';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail} / admin123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const existingEvent = await Event.findOne({ title: 'Tech Fest 2025' });
  if (!existingEvent) {
    await Event.create({
      title: 'Tech Fest 2025',
      description: 'Annual college technical festival with coding contests, hackathons and tech talks.',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      venue: 'Main Auditorium',
      category: 'Technical',
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalSeats: 150,
      availableSeats: 150,
      createdBy: admin._id,
    });
    console.log('Sample event created.');
  } else {
    console.log('Sample event already exists, skipping.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

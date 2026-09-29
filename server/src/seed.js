require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is not defined in environment variables');
    }

    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`Admin "${username}" already exists. Nothing to do.`);
    } else {
      await User.create({ username, password, role: 'Admin' });
      console.log(`Admin "${username}" created successfully.`);
    }
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
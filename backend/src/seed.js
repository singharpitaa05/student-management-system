import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/user.model.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoUri || !adminEmail || !adminPassword) {
      logger.error('Missing required environment variables for seeding.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info('Admin user already exists. No need to seed.');
      process.exit(0);
    }

    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
    });

    await admin.save();
    logger.info('Admin user seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

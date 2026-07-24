import mongoose from 'mongoose';
import { envConfig } from './env.config.js';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.mongoUri);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

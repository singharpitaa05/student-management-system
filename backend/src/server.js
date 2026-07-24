import buildApp from './app.js';
import { connectDB } from './config/db.config.js';
import { envConfig } from './config/env.config.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const app = await buildApp();

    // Start server
    await app.listen({ port: envConfig.port, host: '0.0.0.0' });
    
    logger.info(`Server is running in ${envConfig.nodeEnv} mode on port ${envConfig.port}`);
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

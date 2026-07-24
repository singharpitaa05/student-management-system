import logger from '../utils/logger.js';

export const errorHandler = (error, request, reply) => {
  const statusCode = error.statusCode || 500;
  
  const response = {
    success: false,
    statusCode,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
  };

  // Log error
  if (statusCode === 500) {
    logger.error(`[500] ${error.message}\n${error.stack}`);
  } else {
    logger.warn(`[${statusCode}] ${error.message}`);
  }

  reply.status(statusCode).send(response);
};

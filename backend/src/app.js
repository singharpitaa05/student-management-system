import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from './middlewares/errorHandler.middleware.js';
import corsPlugin from './plugins/cors.plugin.js';
import rateLimitPlugin from './plugins/rateLimit.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import multipartPlugin from './plugins/multipart.plugin.js';
import authPlugin from './plugins/auth.plugin.js';
import logger from './utils/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import teacherRoutes from './modules/teacher/teacher.routes.js';
import studentRoutes from './modules/student/student.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import courseRoutes from './modules/course/course.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildApp = async () => {
  const fastify = Fastify({
    loggerInstance: logger,
  });

  // Core Plugins
  await fastify.register(helmet, { crossOriginResourcePolicy: { policy: 'cross-origin' } });
  await fastify.register(formbody);
  await fastify.register(cookie);

  // Custom Plugins
  await fastify.register(corsPlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(multipartPlugin);
  await fastify.register(authPlugin);

  // Static file serving for local uploads (fallback when Cloudinary is unavailable)
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Error Handler
  fastify.setErrorHandler(errorHandler);

  // Routes
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(teacherRoutes, { prefix: '/api/teachers' });
  fastify.register(studentRoutes, { prefix: '/api/students' });
  fastify.register(uploadRoutes, { prefix: '/api/upload' });
  fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });
  fastify.register(courseRoutes, { prefix: '/api/courses' });
  fastify.register(attendanceRoutes, { prefix: '/api/attendance' });
  fastify.register(notificationRoutes, { prefix: '/api/notifications' });
  fastify.register(paymentRoutes, { prefix: '/api/payments' });

  fastify.get('/api/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
};

export default buildApp;

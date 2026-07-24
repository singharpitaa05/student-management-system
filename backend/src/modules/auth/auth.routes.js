import { authController } from './auth.controller.js';
import * as schemas from './auth.schema.js';

export default async function authRoutes(fastify, options) {
  fastify.post('/signup', { schema: schemas.signupSchema }, authController.signup);
  
  fastify.post(
    '/login',
    {
      schema: schemas.loginSchema,
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    authController.login
  );

  fastify.post('/refresh', { schema: schemas.refreshSchema }, authController.refresh);
  
  fastify.post(
    '/logout',
    {
      schema: schemas.logoutSchema,
      preHandler: [fastify.authenticate], // Needs auth to get userId
    },
    authController.logout
  );

  fastify.post(
    '/forgot-password',
    {
      schema: schemas.forgotPasswordSchema,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '5 minutes',
        },
      },
    },
    authController.forgotPassword
  );

  fastify.post('/reset-password', { schema: schemas.resetPasswordSchema }, authController.resetPassword);
}

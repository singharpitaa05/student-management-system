import { paymentController } from './payment.controller.js';
import * as schemas from './payment.schema.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

export default async function paymentRoutes(fastify, options) {
  // Webhook is public and called by Razorpay
  fastify.post('/webhook', paymentController.webhook);

  fastify.addHook('preHandler', fastify.authenticate);

  // Only students can pay
  fastify.post('/create-order', { schema: schemas.createOrderSchema, preHandler: authorize('student') }, paymentController.createOrder);
  fastify.post('/verify', { schema: schemas.verifyPaymentSchema, preHandler: authorize('student') }, paymentController.verifyPayment);
  
  fastify.get('/my-payments', { preHandler: authorize('student') }, paymentController.getMyPayments);
}

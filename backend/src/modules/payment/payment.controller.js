import { paymentService } from './payment.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const paymentController = {
  async createOrder(request, reply) {
    const orderDetails = await paymentService.createOrder(request.user.userId, request.body.courseId);
    reply.status(201).send(new ApiResponse(201, orderDetails, 'Order created successfully'));
  },

  async verifyPayment(request, reply) {
    const payment = await paymentService.verifyPayment(request.body, request.user.userId);
    reply.send(new ApiResponse(200, payment, 'Payment verified successfully'));
  },

  async getMyPayments(request, reply) {
    const payments = await paymentService.getMyPayments(request.user.userId);
    reply.send(new ApiResponse(200, payments, 'Payments retrieved successfully'));
  },

  async webhook(request, reply) {
    const signature = request.headers['x-razorpay-signature'];
    await paymentService.handleWebhook(request.body, signature);
    reply.status(200).send({ status: 'ok' });
  }
};

export const createOrderSchema = {
  body: {
    type: 'object',
    required: ['courseId'],
    properties: {
      courseId: { type: 'string' }
    }
  }
};

export const verifyPaymentSchema = {
  body: {
    type: 'object',
    required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
    properties: {
      razorpay_order_id: { type: 'string' },
      razorpay_payment_id: { type: 'string' },
      razorpay_signature: { type: 'string' },
    }
  }
};

import { Payment } from '../../models/payment.model.js';
import { Course } from '../../models/course.model.js';
import { Student } from '../../models/student.model.js';
import { razorpayInstance } from '../../config/razorpay.config.js';
import { envConfig } from '../../config/env.config.js';
import { sendPaymentEmail, sendEnrollmentEmail } from '../../emails/mailer.service.js';
import { notificationService } from '../notification/notification.service.js';
import ApiError from '../../utils/apiError.js';
import crypto from 'crypto';

export const paymentService = {
  async createOrder(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    
    // Check if student is already enrolled
    if (course.students.includes(userId)) {
      throw new ApiError(400, 'Already enrolled in this course');
    }

    // Usually you'd have a price field on the course, for this demo we'll just fix it to 1000 INR
    const amount = 1000;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    const payment = await Payment.create({
      student: userId,
      course: courseId,
      amount: amount,
      currency: 'INR',
      razorpayOrderId: order.id
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: envConfig.razorpay.keyId,
    };
  },

  async verifyPayment(data, userId) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", envConfig.razorpay.keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Find order and mark as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      throw new ApiError(400, 'Invalid payment signature');
    }

    // Payment is valid
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'successful'
      },
      { new: true }
    ).populate('course');

    if (!payment) throw new ApiError(404, 'Payment record not found');

    // Enroll the student
    const course = await Course.findById(payment.course._id);
    if (!course.students.includes(userId)) {
      course.students.push(userId);
      await course.save();
    }

    // Update Student Fee Status to Paid
    const student = await Student.findByIdAndUpdate(userId, { feeStatus: 'paid' }, { new: true });

    // Send Emails and Notifications asynchronously (do not block response)
    Promise.all([
      sendPaymentEmail(student.email, student.name, payment.amount, course.name),
      sendEnrollmentEmail(student.email, student.name, course.name),
      notificationService.sendNotification({
        recipients: [userId],
        title: 'Payment Successful',
        message: `Your payment of ₹${payment.amount} for ${course.name} was successful. You are now enrolled.`,
        type: 'payment'
      })
    ]).catch(err => console.error("Post-payment actions failed:", err));

    return payment;
  },
  
  async getMyPayments(userId) {
    return await Payment.find({ student: userId, status: 'successful' })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
  },

  async handleWebhook(body, signature) {
    const expectedSignature = crypto
      .createHmac("sha256", envConfig.razorpay.webhookSecret || envConfig.razorpay.keySecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(400, 'Invalid webhook signature');
    }

    if (body.event === 'order.paid') {
      const { order_id, payment_id } = body.payload.payment.entity;
      
      const payment = await Payment.findOne({ razorpayOrderId: order_id });
      if (payment && payment.status !== 'successful') {
        payment.status = 'successful';
        payment.razorpayPaymentId = payment_id;
        await payment.save();

        const course = await Course.findById(payment.course);
        if (course && !course.students.includes(payment.student)) {
          course.students.push(payment.student);
          await course.save();
          await Student.findByIdAndUpdate(payment.student, { feeStatus: 'paid' });
        }
      }
    }
    return true;
  }
};

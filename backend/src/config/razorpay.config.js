import Razorpay from 'razorpay';
import { envConfig } from './env.config.js';

export const razorpayInstance = new Razorpay({
  key_id: envConfig.razorpay.keyId,
  key_secret: envConfig.razorpay.keySecret,
});

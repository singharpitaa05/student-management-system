import nodemailer from 'nodemailer';
import { envConfig } from './env.config.js';

export const mailerTransporter = nodemailer.createTransport({
  host: envConfig.smtp.host,
  port: envConfig.smtp.port,
  secure: envConfig.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: envConfig.smtp.user,
    pass: envConfig.smtp.pass,
  },
});

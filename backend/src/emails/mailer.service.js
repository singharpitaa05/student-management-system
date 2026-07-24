import { mailerTransporter } from '../config/mailer.config.js';
import { envConfig } from '../config/env.config.js';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderTemplate = async (templateName, context) => {
  const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  const templateHtml = await fs.readFile(filePath, 'utf-8');
  const template = handlebars.compile(templateHtml);
  return template(context);
};

export const sendEmail = async ({ to, subject, templateName, context }) => {
  try {
    const html = await renderTemplate(templateName, context);
    
    await mailerTransporter.sendMail({
      from: envConfig.smtp.from,
      to,
      subject,
      html,
    });
    
    logger.info(`Email sent to ${to} (template: ${templateName})`);
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to Student Management System',
    templateName: 'welcome',
    context: { name, frontendUrl: envConfig.frontendUrl },
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    templateName: 'password-reset',
    context: { resetLink },
  });
};

export const sendEnrollmentEmail = async (email, name, courseName) => {
  return sendEmail({
    to: email,
    subject: `You've been enrolled in ${courseName}!`,
    templateName: 'enrollment',
    context: { name, courseName, frontendUrl: envConfig.frontendUrl },
  });
};

export const sendPaymentEmail = async (email, name, amount, courseName) => {
  return sendEmail({
    to: email,
    subject: `Payment Receipt for ${courseName}`,
    templateName: 'payment',
    context: { name, amount, courseName },
  });
};

export const sendHolidayEmail = async (email, title, message) => {
  return sendEmail({
    to: email,
    subject: title,
    templateName: 'holiday',
    context: { title, message },
  });
};

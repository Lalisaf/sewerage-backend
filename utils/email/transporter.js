import nodemailer from 'nodemailer';
import { emailConfig } from './email.js';
import { APP_CONFIG } from '../../config/constants.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.port === 465, // true for 465, false for other ports
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
};

export const transporter = createTransporter();
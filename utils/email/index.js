import { transporter } from './transporter.js';
import { 
  verificationEmailTemplate, 
  passwordResetTemplate, 
  serviceNotificationTemplate 
} from './templates.js';
import { emailConfig } from './email.js';
import { APP_CONFIG } from '../../config/constants.js';

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${APP_CONFIG.clientUrl}/verify-email/${token}`;
  
  await transporter.sendMail({
    from: `"Sewerage Service" <${emailConfig.user}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: verificationEmailTemplate(verificationUrl),
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${APP_CONFIG.clientUrl}/reset-password/${token}`;
  
  await transporter.sendMail({
    from: `"Sewerage Service" <${emailConfig.user}>`,
    to: email,
    subject: 'Password Reset Request',
    html: passwordResetTemplate(resetUrl),
  });
};

export const sendServiceNotification = async (email, message) => {
  await transporter.sendMail({
    from: `"Sewerage Service" <${emailConfig.user}>`,
    to: email,
    subject: 'Service Notification',
    html: serviceNotificationTemplate(message),
  });
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendServiceNotification,
};
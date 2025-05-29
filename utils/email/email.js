import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD,
  from: process.env.EMAIL_FROM || 'no-reply@seweragesystem.com',
  secure: process.env.SMTP_SECURE === 'true', // Convert to boolean
  tls: process.env.SMTP_TLS === 'true' ? {
    rejectUnauthorized: false
  } : undefined
};

export default emailConfig;
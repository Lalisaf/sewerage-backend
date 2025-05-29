const nodemailer = require('nodemailer');
const { email: emailConfig } = require('../config/configs');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465, // better dynamic secure handling
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

// Optional: verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${config.clientUrl}/verify-email/${token}`;

    await transporter.sendMail({
      from: `"Sewerage Service" <${config.email.user}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Could not send verification email');
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${config.clientUrl}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Sewerage Service" <${config.email.user}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Could not send password reset email');
  }
};

const sendServiceNotification = async (email, message) => {
  try {
    await transporter.sendMail({
      from: `"Sewerage Service" <${config.email.user}>`,
      to: email,
      subject: 'Service Notification',
      html: `<p>${message}</p>`
    });
  } catch (error) {
    console.error('Failed to send service notification:', error);
    throw new Error('Could not send service notification');
  }
};

export { sendVerificationEmail, sendPasswordResetEmail, sendServiceNotification };

export const verificationEmailTemplate = (verificationUrl) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Verify Your Email Address</h2>
    <p>Thank you for registering with our service.</p>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verificationUrl}" 
       style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
      Verify Email
    </a>
    <p>If you didn't request this, please ignore this email.</p>
  </div>
`;

export const passwordResetTemplate = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" 
       style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  </div>
`;

export const serviceNotificationTemplate = (message) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Service Notification</h2>
    <p>${message}</p>
    <p>Thank you for using our services.</p>
  </div>
`;
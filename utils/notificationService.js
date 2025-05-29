const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { User, Request } = require('../models');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

const twilioClient = twilio(config.twilio.sid, config.twilio.token);

exports.sendDelayAlert = async (requestId) => {
  const request = await Request.findByPk(requestId, {
    include: [{ model: User, as: 'requester' }]
  });

  // Email notification
  await transporter.sendMail({
    to: request.requester.email,
    subject: 'Service Delay Notification',
    html: `<p>Your service request #${request.id} is experiencing delays. Estimated new arrival time: ${request.eta}</p>`
  });

  // SMS notification
  if (request.requester.phone) {
    await twilioClient.messages.create({
      body: `Service delay alert for request #${request.id}. New ETA: ${request.eta}`,
      from: config.twilio.phone,
      to: request.requester.phone
    });
  }
};

exports.sendCriticalFailureAlert = async (vehicleId, error) => {
  const admins = await User.findAll({ where: { role: 'admin' } });
  
  await Promise.all(admins.map(async admin => {
    await transporter.sendMail({
      to: admin.email,
      subject: 'Critical Vehicle Failure',
      html: `<p>Vehicle ${vehicleId} has reported a critical failure: ${error}</p>`
    });
  }));
};
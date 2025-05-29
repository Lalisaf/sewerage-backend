// services/notificationService.js
import db from '../models/index.js';
const { Notification, User } = db;
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebase-service-account.json'))
  });
}

export const sendPushNotification = async (deviceToken, { title, body, data }) => {
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token: deviceToken
    };

    await admin.messaging().send(message);
    return true;
  } catch (err) {
    console.error('Error sending push notification:', err);
    return false;
  }
};

export const getUserNotifications = async (userId, limit = 10) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit
  });
};

export const markAsRead = async (notificationId) => {
  return await Notification.update(
    { read: true },
    { where: { id: notificationId } }
  );
};
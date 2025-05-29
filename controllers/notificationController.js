// controllers/notificationController.js
import db from '../models/index.js';
const { Notification } = db;

export const getUserNotifications = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { userId: req.user.user_id },
      order: [['createdAt', 'DESC']],
      limit: +limit,
      offset: +offset
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { 
        id,
        userId: req.user.user_id 
      }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }

    await notification.update({ read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { 
        where: { 
          userId: req.user.user_id,
          read: false
        }
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { 
        userId: req.user.user_id,
        read: false
      }
    });
    res.json({ 
      success: true,
      count 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
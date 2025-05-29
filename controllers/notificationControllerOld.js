import db from '../models/index.js'; // Import the models from index.js
const { Notification, User } = db; // Destructure the models
//import { Notification } from '../models/index.js';  // Adjust the path based on your project structure

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, read = false } = req.body;
    const notification = await Notification.create({ userId, title, message, read });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = read;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

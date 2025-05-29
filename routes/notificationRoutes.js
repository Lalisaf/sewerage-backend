// routes/notificationRoutes.js
import express from 'express';
import { 
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/:id/read', protect, markNotificationAsRead);
router.patch('/mark-all-read', protect, markAllNotificationsAsRead);

export default router;
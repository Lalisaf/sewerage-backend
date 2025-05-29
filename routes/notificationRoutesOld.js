import express from 'express';
import { createNotification, getNotifications, updateNotification, deleteNotification } from '../controllers/notificationControllerOld.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/:userId', getNotifications);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

export default router;  // Use export default to export the router

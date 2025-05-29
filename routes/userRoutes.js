import express from 'express'; // Import express for routing
const router = express.Router();
import {createUser, getAllUsers, updateUser, deleteUser, getUserById, verifyUser, updateUserStatus} from '../controllers/userController.js'; // Adjust the import based on your project structure
import { authorize } from '../middlewares/authMiddleware.js'; // Adjust the import based on your middleware location
import { protect, verifyAdmin } from '../middlewares/auth.js';

// Public routes
router.post('/', createUser);

// Admin protected routes
router.get('/', protect, verifyAdmin, getAllUsers);
router.get('/:id', protect, verifyAdmin, getUserById);
router.get('/:id/edit', protect, verifyAdmin, getUserById); // For editing user details
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.patch('/:id/verify', protect, authorize('admin'), verifyUser);
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

export default router;

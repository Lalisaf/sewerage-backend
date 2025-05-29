import express from 'express'; // Import express for routing
const router = express.Router();
//import {getAllUsers} from '../controllers/userControllerold.js'; // Adjust the import based on your project structure
import { authorize } from '../middlewares/authMiddleware.js'; // Adjust the import based on your middleware locatio
import { protect, verifyAdmin } from '../middlewares/auth.js';
import { getAllUsers, createUser } from '../controllers/userControllerold.js';

// Public routes
router.post('/', createUser);

// Admin protected routes
router.get('/', protect, verifyAdmin, getAllUsers);

export default router;
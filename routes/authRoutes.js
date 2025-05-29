// routes/authRoutes.js
import express from 'express';
import {
  loginUser,
  registerUser,
  requestVerification,
  verifyAccount,
  getUserFromToken
} from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/request-verification', requestVerification);
router.get('/verify-account/:token', verifyAccount);

// Protected routes (require valid token)
router.get('/verify-token', verifyToken, getUserFromToken);

// Optional: Add token refresh endpoint if needed
// router.post('/refresh-token', refreshToken);

export default router;

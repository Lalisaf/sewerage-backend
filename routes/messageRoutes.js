import express from 'express';
const router = express.Router();
import { sendMessage, getRequestMessages } from '../controllers/messageController.js'; // Correct import based on your project structure

// Uncomment and adjust the import based on your middleware location
// import { protect } from '../middlewares/authMiddleware.js'; 

router.post('/', sendMessage);
router.get('/:requestId', getRequestMessages);

export default router;  // Export using ES module syntax

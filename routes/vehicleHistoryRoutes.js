import express from 'express';
const router = express.Router();
 import { getHistory } from '../controllers/vehicleHistoryController.js'; // Adjust the import based on your project structure
router.get('/:vehicleId/:days?', getHistory);

export default router;

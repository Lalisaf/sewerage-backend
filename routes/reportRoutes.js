import express from 'express';
const router = express.Router();
import { generateReport, predictDemand } from '../controllers/reportController.js'; // Adjust the import based on your project structure
//const reportController = require('../controllers/reportController');

router.get('/generate/:period', generateReport);
router.get('/predict-demand', predictDemand);

export default router; // Use export default to export the router

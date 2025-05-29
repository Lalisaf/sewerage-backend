import express from 'express';
const router = express.Router();
import { trackVehicle, getHistory } from '../controllers/trackingController.js'; // Adjust the import based on your project structure
router.get('/track/:vehicleId', trackVehicle);
router.get('/history/:vehicleId', getHistory); // Assuming you have a getHistory function in your controller

export default router; // Use export default to export the router

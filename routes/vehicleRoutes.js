import express from 'express';
const router = express.Router();
import { 
  createVehicle,
  getAllVehicles,
  getAvailableDrivers,
  getVehicleById,
  updateVehicle,
  deleteVehicle, 
  getAvailableVihicles,
  AssignDriver,
  UnassignDriver
} from '../controllers/vehicleController.js';
import { protect, verifyAdmin } from '../middlewares/auth.js';

// Apply protect middleware first to ensure user is authenticated
// Then verifyAdmin to check for admin privileges
router.post('/', protect, verifyAdmin, createVehicle);
router.get('/', protect, verifyAdmin, getAllVehicles);
router.get('/available-drivers', protect, getAvailableDrivers);
router.get('/available', protect, getAvailableVihicles)
router.put('/:id/driver', protect, verifyAdmin, AssignDriver);
router.get('/:id', protect, verifyAdmin, getVehicleById);
router.put('/:id', protect, verifyAdmin, updateVehicle);
router.delete('/:id', protect, verifyAdmin, deleteVehicle);

export default router;
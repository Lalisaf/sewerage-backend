import express from 'express';
import {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getNearbyRequests,
  updateRequestStatus,
  getStats
} from '../controllers/requestController.js'; // <-- ✅ fixed (added .js)

import { authorize, protect } from '../middlewares/authMiddleware.js'; // Use protect and authorize from authMiddleware.js
// Removed imports from middlewares/auth.js to avoid redundancy
const router = express.Router();
import {upload} from '../middlewares/uploadMiddleware.js';




router
  .route('/')
  .get(protect, authorize('admin'), getRequests)
  .post(upload.array('images', 5), createRequest);

router
  .route('/nearby')
  .get(protect, authorize('driver'), getNearbyRequests);

router
  .route('/:id')
  .get(protect, getRequest)
  .put(protect, authorize('admin', 'operator'), updateRequest)
  .delete(protect, authorize('admin'), deleteRequest);

router
  .route('/:id/status')
  .get(protect, getRequest) // Assuming you want to get the request before updating status
  .put(protect, authorize('driver','admin'), updateRequestStatus);

router
.route('/stats')
.get(protect,getStats);


export default router;

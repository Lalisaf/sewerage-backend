// backend/routes/requestRoutes.js
const express = require('express');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getNearbyRequests,
  updateRequestStatus
} = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin', 'operator'), getRequests)
  .post(createRequest);

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
  .put(protect, authorize('driver'), updateRequestStatus);

module.exports = router;
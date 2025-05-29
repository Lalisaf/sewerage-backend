// routes/dashboardRoutes.js
import express from 'express';
import { getKPIs, getGISData } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/kpis', getKPIs);
router.get('/gis', getGISData);
// router.get('/reports/:period', generateReport);
// router.get('/predictions', predictDemand);

export default router;

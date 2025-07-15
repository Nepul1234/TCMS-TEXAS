import express from 'express';
import { 
  getDashboardMetrics, 
  verifyTokenAndGetUser
} from '../controllers/student.dashboard.metrics.controller.js';

const router = express.Router();

router.get('/metrics', verifyTokenAndGetUser, getDashboardMetrics);


export default router;
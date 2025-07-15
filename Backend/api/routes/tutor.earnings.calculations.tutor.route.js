import express from 'express';
import { getTutorEarnings } from '../controllers/tutor.earnings.calculation.tutor.controller.js';

const router = express.Router();

// Get earnings calculations for a specific tutor
router.get('/get_tutor_earnings', getTutorEarnings);

export default router;
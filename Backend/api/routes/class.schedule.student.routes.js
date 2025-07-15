import express from 'express';
import { getStudentSchedules, getStudentScheduleSummary } from '../controllers/class.schedule.controller.js'; // Adjust the import path as necessary
// Adjust the import path as necessary

const router = express.Router();

// Route to get student schedules
router.get('/:studentId', getStudentSchedules);

// Route for schedule summary
router.get('/summary/:studentId', getStudentScheduleSummary);

export default router;
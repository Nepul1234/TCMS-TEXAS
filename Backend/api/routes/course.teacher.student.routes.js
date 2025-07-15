import express from 'express';
import getCourses from '../controllers/course.teacher.controller.js';

const router = express.Router();

// Only route needed - get teacher's courses
router.get('/', getCourses);

export default router;
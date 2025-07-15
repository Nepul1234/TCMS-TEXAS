
import { Router } from 'express';
import { getAllCourseEnrollments } from '../controllers/course.enrollment.tutor.controller.js';

const router = Router();

router.get('/get_course_enrollment',getAllCourseEnrollments);

export default router;
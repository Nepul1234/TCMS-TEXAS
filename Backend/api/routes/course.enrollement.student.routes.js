import { getCourseEnrollmentByID } from '../controllers/course.enrollment.controller.js';
import { getStudentEnrolledCourseCount } from '../controllers/course.enrollment.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/getCourseEnrollmentByID', getCourseEnrollmentByID);
router.post('/getStudentEnrolledCourseCount', getStudentEnrolledCourseCount);

export default router;
import express from 'express'
import { getCourseEnrollment,getCourseEnrollmentRequests,approveCourseEnrollmentRequest, getAllCoursesWithStudentsAndTeachers } from '../controllers/course.enrollment.controller.js';

const router = express.Router()

router.post('/getCourseEnrollment', getCourseEnrollment);
router.get('/courseEnrollmentRequests', getCourseEnrollmentRequests);
router.post('/approveEnrollmentRequest', approveCourseEnrollmentRequest);
router.get('/getAllCourses', getAllCoursesWithStudentsAndTeachers);
router.get('/getAllCoursesWithStudentsAndTeachers', getAllCoursesWithStudentsAndTeachers); // Assuming this is for admin to see all courses with students and teachers

export default router;
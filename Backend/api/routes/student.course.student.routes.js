import express from 'express';
import { upload } from '../controllers/azure.file.controller.js';
import {
  getCourseMaterials,
  downloadMaterialFile,
  getCourseAssignments,
  getAssignmentDetails,
  submitAssignment,
  getStudentSubmissions,
  getCourseInfo,
  getEnrolledCourses
} from '../controllers/student.course.controller.js';

const router = express.Router();

// Course Information Routes
router.get('/:courseId/info', getCourseInfo);

// Course Materials Routes
router.get('/:courseId/materials', getCourseMaterials);
router.get('/materials/:materialId/download/:fileIndex', downloadMaterialFile);

// Assignment Routes
router.get('/:courseId/assignments', getCourseAssignments);
router.get('/assignments/:assignmentId', getAssignmentDetails);

// Assignment submission with Azure upload middleware
router.post('/assignments/:assignmentId/submit', upload.array('files', 10), submitAssignment);

// Submission Routes
router.get('/:courseId/submissions', getStudentSubmissions);

router.get('/enrolled',getEnrolledCourses);

export default router;
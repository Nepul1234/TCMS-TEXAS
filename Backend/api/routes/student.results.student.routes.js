import express from 'express';
import {
  getStudentResults,
  getStudentResultsByCourse
} from '../controllers/student.results.controller.js';

const router = express.Router();


// Route: GET /api/student-results/:student_id
router.get('/:student_id', getStudentResults);


// Route: GET /api/student-results/:student_id/course/:course_id
router.get('/:student_id/course/:course_id', getStudentResultsByCourse);


export default router;
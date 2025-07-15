import express from 'express';
import { getAllStudentMarks } from '../controllers/tutor.gradings.tutor.controller.js';
import { updateStudentMarks } from '../controllers/tutor.gradings.tutor.controller.js';

const router = express.Router();
// Route to get all student marks
router.get('/get_all_student_marks', getAllStudentMarks);
// Route to update student marks
router.put('/update_student_marks/:id', updateStudentMarks);
export default router;

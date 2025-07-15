import express from 'express';
import { 
  createQuiz, 
  updateQuiz, 
  getQuiz, 
  getTeacherQuizzes, 
  publishQuiz, 
  deleteQuiz, 
  getTeacherCourses,
  archiveQuiz
} from '../controllers/quiz.controller.js';

import { requireRole, authMiddleware } from '../controllers/auth.controller.js';

const router = express.Router();

// Middleware to authenticate teacher
const authenticateTeacher = [
  authMiddleware,
  requireRole('teacher')
];

// Quiz CRUD Routes
router.post('/quizzes', authenticateTeacher, createQuiz);
router.get('/teacher/quizzes', authenticateTeacher, getTeacherQuizzes);
router.get('/quizzes/:id', authenticateTeacher, getQuiz);
router.put('/quizzes/:id', authenticateTeacher, updateQuiz);
router.delete('/quizzes/:id', authenticateTeacher, deleteQuiz);
router.patch('/quizzes/:id/publish', authenticateTeacher, publishQuiz);
router.patch('/quizzes/:id/archive', authenticateTeacher, archiveQuiz);

// Helper routes
router.get('/teacher/courses', authenticateTeacher, getTeacherCourses);

export default router;


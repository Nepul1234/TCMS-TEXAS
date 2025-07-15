import express from 'express';
import {
  getStudentQuizzes,
  getStudentCourses,
  getQuizStats,
  validateQuizPassword,
  getQuizForAttempt,
  startQuizAttempt,
  getQuizQuestions,
  submitAnswer,
  submitQuiz,
  getQuizResults,
  getQuizReview
} from '../controllers/quiz.stu.controller.js';

const router = express.Router();

// Student quiz management
router.get('/student/:studentId/quizzes', getStudentQuizzes);
router.get('/student/:studentId/courses', getStudentCourses);
router.get('/student/:studentId/stats', getQuizStats);

// Quiz access and validation
router.post('/:quizId/validate-password', validateQuizPassword);
router.get('/:quizId/student/:studentId/attempt-info', getQuizForAttempt);

// Quiz attempt management
router.post('/start-attempt', startQuizAttempt);
router.get('/:quizId/attempt/:attemptId/questions', getQuizQuestions);
router.post('/submit-answer', submitAnswer);
router.post('/attempt/:attemptId/submit', submitQuiz);

// Results
router.get('/attempt/:attemptId/results', getQuizResults);

router.get('/attempt/:attemptId/review', getQuizReview);

export default router;
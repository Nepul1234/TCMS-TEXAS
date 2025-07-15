import express from 'express';
import {
  getQuizAnalytics,
  getQuizInsights,
  exportQuizAnalytics
} from '../controllers/quiz.analytics.controller.js'; // Adjust path according to your project structure

const router = express.Router();

// Middleware for authentication (add your auth middleware here)
// import authenticateToken from '../middleware/auth.js';

// Routes for quiz analytics
// GET /api/quiz-analytics/:id - Get comprehensive analytics for a specific quiz
router.get('/:id', getQuizAnalytics);

// GET /api/quiz-analytics/:id/insights - Get AI-generated insights for a specific quiz
router.get('/:id/insights', getQuizInsights);

// GET /api/quiz-analytics/:id/export - Export analytics data (CSV format)
router.get('/:id/export', exportQuizAnalytics);

export default router;
import pool from '../utils/dbconn.js';
import errorHandler from '../utils/error.js';

// Utility function to safely convert and format numbers
const safeNumber = (value, defaultValue = 0, decimals = null) => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  const num = Number(value);
  return decimals !== null ? parseFloat(num.toFixed(decimals)) : num;
};

// Utility function to safely format percentage
const safePercentage = (numerator, denominator, decimals = 2) => {
  if (!denominator || denominator === 0) return 0;
  const percentage = (numerator / denominator) * 100;
  return safeNumber(percentage, 0, decimals);
};

// Get comprehensive quiz analytics
export const getQuizAnalytics = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }

    // Get quiz basic information
    const quizQuery = `
      SELECT q.*, c.course_name, c.course_id AS course_code
      FROM quizzes q
      JOIN course c ON q.course_id = c.course_id
      WHERE q.id = ?
    `;
    
    const [quizRows] = await pool.execute(quizQuery, [quizId]);
    
    if (quizRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizRows[0];

    // Get quiz summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT s.stu_id) as total_students,
        COUNT(DISTINCT qa.student_id) as attempted_students,
        COUNT(DISTINCT CASE WHEN qa.is_passed = 1 THEN qa.student_id END) as passed_students,
        COALESCE(AVG(qa.percentage), 0) as average_score,
        COALESCE(MAX(qa.percentage), 0) as highest_score,
        COALESCE(MIN(qa.percentage), 0) as lowest_score,
        COALESCE(AVG(qa.time_spent_seconds / 60), 0) as average_time_spent,
        COUNT(qa.id) as total_attempts,
        COALESCE(AVG(qa.attempt_number), 0) as average_attempts
      FROM quizzes qz
      LEFT JOIN course c ON qz.course_id = c.course_id
      LEFT JOIN course_enrollment e ON c.course_id = e.course_id
      LEFT JOIN student s ON e.stu_id = s.stu_id
      LEFT JOIN quiz_attempts qa ON qz.id = qa.quiz_id AND s.stu_id = qa.student_id
      WHERE qz.id = ?
    `;
    
    const [summaryRows] = await pool.execute(summaryQuery, [quizId]);
    const summary = summaryRows[0];
    
    // Calculate pass rate
    const passRate = safePercentage(
      summary.passed_students, 
      summary.attempted_students, 
      1
    );

    // Get question analysis
    const questionAnalysisQuery = `
      SELECT 
        qq.id,
        qq.question_text,
        qq.question_type,
        qq.marks,
        qq.difficulty,
        qq.order_index,
        COUNT(DISTINCT sa.attempt_id) as total_attempts,
        COUNT(DISTINCT CASE WHEN sa.is_correct = 1 THEN sa.attempt_id END) as correct_attempts,
        COALESCE(AVG(sa.time_spent_seconds / 60), 0) as avg_time_spent
      FROM quiz_questions qq
      LEFT JOIN student_answers sa ON qq.id = sa.question_id
      LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id AND qa.status = 'completed'
      WHERE qq.quiz_id = ?
      GROUP BY qq.id, qq.question_text, qq.question_type, qq.marks, qq.difficulty, qq.order_index
      ORDER BY qq.order_index
    `;
    
    const [questionRows] = await pool.execute(questionAnalysisQuery, [quizId]);
    
    // Helper function to get common mistakes for a question
    const getCommonMistakes = async (question) => {
      let commonMistakes = [];
      
      if (question.question_type === 'mcq') {
        // Get wrong options selected frequently
        const mistakesQuery = `
          SELECT qo.option_text, COUNT(*) as selection_count
          FROM student_answers sa
          JOIN quiz_attempts qa ON sa.attempt_id = qa.id
          JOIN question_options qo ON sa.selected_option_id = qo.id
          WHERE sa.question_id = ? AND sa.is_correct = 0 AND qa.status = 'completed'
          GROUP BY qo.option_text
          ORDER BY selection_count DESC
          LIMIT 3
        `;
        
        const [mistakeRows] = await pool.execute(mistakesQuery, [question.id]);
        commonMistakes = mistakeRows.map(row => `Selected "${row.option_text}" (${row.selection_count} times)`);
      } else if (question.question_type === 'short_answer') {
        // Get common wrong answers
        const mistakesQuery = `
          SELECT sa.answer_text, COUNT(*) as frequency
          FROM student_answers sa
          JOIN quiz_attempts qa ON sa.attempt_id = qa.id
          WHERE sa.question_id = ? AND sa.is_correct = 0 AND qa.status = 'completed'
            AND sa.answer_text IS NOT NULL AND sa.answer_text != ''
          GROUP BY sa.answer_text
          ORDER BY frequency DESC
          LIMIT 3
        `;
        
        const [mistakeRows] = await pool.execute(mistakesQuery, [question.id]);
        commonMistakes = mistakeRows.map(row => `"${row.answer_text}" (${row.frequency} times)`);
      }
      
      return commonMistakes;
    };

    // Get common mistakes for each question using async/await
    const questionAnalysis = await Promise.all(
      questionRows.map(async (question) => {
        const commonMistakes = await getCommonMistakes(question);
        const successRate = safePercentage(
          question.correct_attempts, 
          question.total_attempts, 
          2
        );
        
        return {
          id: question.id,
          questionText: question.question_text,
          type: question.question_type,
          marks: question.marks,
          difficulty: question.difficulty,
          correctAttempts: safeNumber(question.correct_attempts, 0),
          totalAttempts: safeNumber(question.total_attempts, 0),
          successRate,
          avgTimeSpent: safeNumber(question.avg_time_spent, 0, 2),
          commonMistakes
        };
      })
    );

    // Get student performance
    const studentPerformanceQuery = `
      SELECT 
        qa.student_id,
        s.Fname as student_name,
        qa.total_marks_obtained as score,
        qa.percentage,
        qa.time_spent_seconds / 60 as time_spent,
        qa.is_passed,
        qa.attempt_number as attempts,
        qa.class_rank as \`rank\`,
        DATE_FORMAT(qa.end_time, '%Y-%m-%d') as attempt_date
      FROM quiz_attempts qa
      JOIN student s ON qa.student_id = s.stu_id
      WHERE qa.quiz_id = ? AND qa.status = 'completed'
      ORDER BY qa.percentage DESC, qa.time_spent_seconds ASC
    `;
    
    const [studentRows] = await pool.execute(studentPerformanceQuery, [quizId]);
    
    const studentPerformance = studentRows.map(row => ({
      id: row.student_id,
      name: row.student_name,
      score: safeNumber(row.score, 0, 1),
      percentage: safeNumber(row.percentage, 0, 1),
      timeSpent: Math.round(safeNumber(row.time_spent, 0)),
      status: row.is_passed ? 'passed' : 'failed',
      attemptDate: row.attempt_date,
      attempts: safeNumber(row.attempts, 1),
      rank: safeNumber(row.rank, 0)
    }));

    // Calculate score distribution using modern array methods
    const scoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    const scoreDistribution = scoreRanges.map(({ range, min, max }) => {
      const count = studentPerformance.filter(student => 
        student.percentage >= min && student.percentage <= max
      ).length;
      
      const percentage = safePercentage(count, studentPerformance.length, 2);
      
      return { range, count, percentage };
    });

    // Format response using object destructuring and spread operator
    const analyticsData = {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        totalMarks: quiz.total_marks,
        questionCount: quiz.question_count,
        duration: quiz.duration_minutes,
        passingMarks: quiz.passing_marks,
        createdDate: quiz.created_at,
        lastAttempt: studentPerformance[0]?.attemptDate || null
      },
      summary: {
        totalStudents: safeNumber(summary.total_students, 0),
        attemptedStudents: safeNumber(summary.attempted_students, 0),
        passedStudents: safeNumber(summary.passed_students, 0),
        averageScore: safeNumber(summary.average_score, 0, 1),
        highestScore: safeNumber(summary.highest_score, 0, 1),
        lowestScore: safeNumber(summary.lowest_score, 0, 1),
        averageTimeSpent: Math.round(safeNumber(summary.average_time_spent, 0)),
        passRate,
        totalAttempts: safeNumber(summary.total_attempts, 0),
        averageAttempts: safeNumber(summary.average_attempts, 0, 1)
      },
      questionAnalysis,
      studentPerformance,
      scoreDistribution
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get quiz insights
export const getQuizInsights = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    
    const insightsQuery = `
      SELECT 
        q.id,
        q.title,
        COUNT(DISTINCT qa.student_id) as attempted_students,
        COUNT(DISTINCT CASE WHEN qa.is_passed = 1 THEN qa.student_id END) as passed_students,
        AVG(qa.percentage) as avg_percentage,
        COUNT(DISTINCT s.stu_id) as total_enrolled_students
      FROM quizzes q
      LEFT JOIN course c ON q.course_id = c.course_id
      LEFT JOIN course_enrollment e ON c.course_id = e.course_id
      LEFT JOIN student s ON e.stu_id = s.stu_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND s.stu_id = qa.student_id AND qa.status = 'completed'
      WHERE q.id = ?
      GROUP BY q.id, q.title
    `;
    
    const [insightRows] = await pool.execute(insightsQuery, [quizId]);
    
    if (insightRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const insight = insightRows[0];
    const insights = [];
    
    // Generate insights using modern conditional logic
    if (insight.attempted_students === 0) {
      insights.push('No students have attempted this quiz yet');
    } else {
      const passRate = safePercentage(insight.passed_students, insight.attempted_students, 1);
      const notAttempted = insight.total_enrolled_students - insight.attempted_students;
      
      // Use array spread and conditional pushing
      if (notAttempted > 0) {
        insights.push(`${notAttempted} student(s) haven't attempted the quiz yet`);
      }
      
      if (passRate >= 85) {
        insights.push(`Excellent pass rate of ${passRate}% - students are performing well`);
      } else if (passRate < 60) {
        insights.push(`Low pass rate of ${passRate}% - consider reviewing difficulty level`);
      }
      
      // Check for difficult questions
      const difficultQuestionsQuery = `
        SELECT COUNT(*) as difficult_count
        FROM quiz_questions qq
        LEFT JOIN student_answers sa ON qq.id = sa.question_id
        LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id AND qa.status = 'completed'
        WHERE qq.quiz_id = ?
        GROUP BY qq.id
        HAVING (COUNT(CASE WHEN sa.is_correct = 1 THEN 1 END) / COUNT(sa.id)) * 100 < 60
      `;
      
      const [difficultRows] = await pool.execute(difficultQuestionsQuery, [quizId]);
      
      if (difficultRows.length > 0) {
        insights.push(`${difficultRows.length} question(s) have success rate below 60% - consider reviewing these topics`);
      }
      
      // Add default insight if only "haven't attempted" insight exists
      if (insights.length === 1 && insights[0].includes("haven't attempted")) {
        insights.push('Quiz performance is within normal range');
      }
    }
    
    // Use nullish coalescing operator for default insights
    const finalInsights = insights.length > 0 ? insights : ['Quiz performance is within normal range'];
    
    res.status(200).json({
      success: true,
      data: { insights: finalInsights }
    });
    
  } catch (error) {
    console.error('Error fetching quiz insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export analytics data to CSV format
export const exportQuizAnalytics = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { type = 'students' } = req.query; // 'students', 'questions', or 'summary'
    
    // Define query configurations using object mapping
    const queryConfigs = {
      students: {
        query: `
          SELECT 
            qa.class_rank as \`Rank\`,
            s.Fname as 'Student Name',
            s.stu_id as 'Student ID',
            qa.total_marks_obtained as 'Score',
            qa.percentage as 'Percentage',
            qa.time_spent_seconds / 60 as 'Time Spent (minutes)',
            qa.attempt_number as 'Attempts',
            CASE WHEN qa.is_passed = 1 THEN 'Passed' ELSE 'Failed' END as 'Status',
            DATE_FORMAT(qa.end_time, '%Y-%m-%d %H:%i:%s') as 'Completion Date'
          FROM quiz_attempts qa
          JOIN student s ON qa.student_id = s.stu_id
          WHERE qa.quiz_id = ? AND qa.status = 'completed'
          ORDER BY qa.percentage DESC
        `,
        filename: `quiz_${quizId}_student_performance.csv`
      },
      questions: {
        query: `
          SELECT 
            qq.order_index as 'Question Number',
            qq.question_text as 'Question',
            qq.question_type as 'Type',
            qq.marks as 'Marks',
            qq.difficulty as 'Difficulty',
            COUNT(DISTINCT sa.attempt_id) as 'Total Attempts',
            COUNT(DISTINCT CASE WHEN sa.is_correct = 1 THEN sa.attempt_id END) as 'Correct Attempts',
            CASE 
              WHEN COUNT(DISTINCT sa.attempt_id) > 0 
              THEN ROUND((COUNT(DISTINCT CASE WHEN sa.is_correct = 1 THEN sa.attempt_id END) / COUNT(DISTINCT sa.attempt_id)) * 100, 2)
              ELSE 0 
            END as 'Success Rate (%)',
            ROUND(AVG(sa.time_spent_seconds / 60), 2) as 'Average Time (minutes)'
          FROM quiz_questions qq
          LEFT JOIN student_answers sa ON qq.id = sa.question_id
          LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id AND qa.status = 'completed'
          WHERE qq.quiz_id = ?
          GROUP BY qq.id, qq.order_index, qq.question_text, qq.question_type, qq.marks, qq.difficulty
          ORDER BY qq.order_index
        `,
        filename: `quiz_${quizId}_question_analysis.csv`
      }
    };

    const config = queryConfigs[type];
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type. Must be "students" or "questions"'
      });
    }

    const [rows] = await pool.execute(config.query, [quizId]);
    
    res.status(200).json({
      success: true,
      data: rows,
      filename: config.filename
    });
    
  } catch (error) {
    console.error('Error exporting quiz analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Default export for backward compatibility
export default {
  getQuizAnalytics,
  getQuizInsights,
  exportQuizAnalytics
};
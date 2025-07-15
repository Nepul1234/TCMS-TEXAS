import pool from "../utils/dbconn.js";
import errorHandler from "../utils/error.js";

// Get all quizzes for a student with filtering options
export const getStudentQuizzes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, status, search } = req.query;

    console.log('getStudentQuizzes called with:', {
      studentId,
      courseId,
      status,
      search
    });

    let query = `
      SELECT 
        q.*,
        c.course_name,
        t.Fname as teacher_name,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ?) as attempt_count,
        (SELECT MAX(percentage) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ?) as best_score,
        (SELECT status FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? ORDER BY attempt_number DESC LIMIT 1) as latest_attempt_status
      FROM quizzes q
      JOIN course c ON q.course_id = c.course_id
      JOIN teacher t ON q.teacher_id = t.teacher_id
      JOIN course_enrollment sc ON sc.course_id = q.course_id
      WHERE sc.stu_id = ? AND q.status = 'published'
    `;

    const queryParams = [studentId, studentId, studentId, studentId];

    // Add course filter
    if (courseId && courseId !== 'all') {
      query += ' AND q.course_id = ?';
      queryParams.push(courseId);
    }

    // Add search filter
    if (search && search.trim() !== '') {
      query += ' AND (q.title LIKE ? OR q.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY q.updated_at DESC';

   // console.log('Executing query:', query);
   // console.log('With params:', queryParams);

    const [quizzes] = await pool.execute(query, queryParams);

    //console.log(`Found ${quizzes.length} quizzes before status filtering`);

    // Process quizzes to add status and attempts info
    const processedQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        // Get all attempts for this quiz by this student
        const [attempts] = await pool.execute(
          `SELECT id, attempt_number, total_marks_obtained as score, percentage, status, 
           DATE_FORMAT(updated_at, '%Y-%m-%d') as completedAt
           FROM quiz_attempts 
           WHERE quiz_id = ? AND student_id = ?
           ORDER BY attempt_number`,
          [quiz.id, studentId]
        );

        // Determine quiz status based on schedule
        const now = new Date();
        const startDate = quiz.start_datetime ? new Date(quiz.start_datetime) : null;
        const endDate = quiz.end_datetime ? new Date(quiz.end_datetime) : null;
        
        let quizStatus = 'active';
        if (startDate && now < startDate) {
          quizStatus = 'upcoming';
        } else if (endDate && now > endDate) {
          quizStatus = 'expired';
        } else if (attempts.length > 0 && quiz.max_attempts <= attempts.length) {
          quizStatus = 'completed';
        }

        // Apply status filter here (after calculating status)
        if (status && status !== 'all' && status !== quizStatus) {
          return null; // This quiz will be filtered out
        }

        return {
          id: quiz.id,
          title: quiz.title || '',
          description: quiz.description || '',
          courseId: quiz.course_id,
          courseName: quiz.course_name || '',
          duration: quiz.duration_minutes || 0,
          totalMarks: quiz.total_marks || 0,
          questionCount: quiz.question_count || 0,
          hasPassword: Boolean(quiz.password),
          difficulty: quiz.difficulty || 'Medium',
          attempts: attempts || [],
          maxAttempts: quiz.max_attempts || 1,
          schedule: {
            startDateTime: quiz.start_datetime,
            endDateTime: quiz.end_datetime
          },
          status: quizStatus,
          teacherName: quiz.teacher_name || '',
          avgScore: parseFloat(quiz.avg_score) || 0,
          bestScore: quiz.best_score || null,
          attemptCount: quiz.attempt_count || 0
        };
      })
    );

    // Filter out null values from status filtering
    const filteredQuizzes = processedQuizzes.filter(quiz => quiz !== null);

    //console.log(`Returning ${filteredQuizzes.length} quizzes after status filtering`);

    res.json({
      success: true,
      data: filteredQuizzes,
      debug: {
        totalFound: quizzes.length,
        afterFiltering: filteredQuizzes.length,
        filters: { courseId, status, search }
      }
    });

  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// Get student's enrolled courses for filter dropdown
export const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const [courses] = await pool.execute(
      `SELECT c.course_id as id, c.course_name as name
       FROM course c
       JOIN course_enrollment sc ON c.course_id = sc.course_id
       WHERE sc.stu_id = ?
       ORDER BY c.course_name`,
      [studentId]
    );

    res.json({
      success: true,
      data: courses || []
    });

  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get quiz statistics for dashboard
export const getQuizStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get total quizzes available to student
    const [totalQuizzesResult] = await pool.execute(
      `SELECT COUNT(DISTINCT q.id) as total
       FROM quizzes q
       JOIN course_enrollment sc ON sc.course_id = q.course_id
       WHERE sc.stu_id = ? AND q.status = 'published'`,
      [studentId]
    );

    // Get completed quizzes count
    const [completedResult] = await pool.execute(
      `SELECT COUNT(DISTINCT qa.quiz_id) as completed
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN course_enrollment sc ON sc.course_id = q.course_id
       WHERE qa.student_id = ? AND qa.status = 'completed' AND sc.stu_id = ?`,
      [studentId, studentId]
    );

    // Get average score
    const [avgScoreResult] = await pool.execute(
      `SELECT AVG(qa.percentage) as avg_score
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN course_enrollment sc ON sc.course_id = q.course_id
       WHERE qa.student_id = ? AND qa.status = 'completed' AND sc.stu_id = ?`,
      [studentId, studentId]
    );

    // Get upcoming quizzes count
    const [upcomingResult] = await pool.execute(
      `SELECT COUNT(DISTINCT q.id) as upcoming
       FROM quizzes q
       JOIN course_enrollment sc ON sc.course_id = q.course_id
       WHERE sc.stu_id = ? AND q.status = 'published' 
       AND q.start_datetime > NOW()`,
      [studentId]
    );

    const stats = {
      totalQuizzes: Number(totalQuizzesResult[0]?.total) || 0,
      completedQuizzes: Number(completedResult[0]?.completed) || 0,
      averageScore: Math.round(Number(avgScoreResult[0]?.avg_score)) || 0,
      upcomingQuizzes: Number(upcomingResult[0]?.upcoming) || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Validate quiz password
export const validateQuizPassword = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { password } = req.body;

    if (!quizId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and password are required'
      });
    }

    const [quiz] = await pool.execute(
      'SELECT password FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const isValidPassword = quiz[0].password === password;

    res.json({
      success: true,
      data: { isValid: isValidPassword }
    });

  } catch (error) {
    console.error('Error validating quiz password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get quiz details for attempting
export const getQuizForAttempt = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    if (!quizId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Student ID are required'
      });
    }

    // Check if student is enrolled in the course
    const [enrollmentCheck] = await pool.execute(
      `SELECT 1 FROM course_enrollment sc
       JOIN quizzes q ON sc.course_id = q.course_id
       WHERE sc.stu_id = ? AND q.id = ?`,
      [studentId, quizId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get quiz details
    const [quiz] = await pool.execute(
      `SELECT q.*, c.course_name, t.Fname
       FROM quizzes q
       JOIN course c ON q.course_id = c.course_id
       JOIN teacher t ON q.teacher_id = t.teacher_id
       WHERE q.id = ? AND q.status = 'published'`,
      [quizId]
    );

    if (quiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not published'
      });
    }

    const quizData = quiz[0];

    // Check if quiz is within time window
    if (quizData.start_datetime) {
      const now = new Date();
      const startDate = new Date(quizData.start_datetime);
      const endDate = new Date(quizData.end_datetime);

      if (now < startDate) {
        return res.status(400).json({
          success: false,
          message: 'Quiz has not started yet'
        });
      }

      if (now > endDate) {
        return res.status(400).json({
          success: false,
          message: 'Quiz has ended'
        });
      }
    }

    // Check attempts limit
    const [attempts] = await pool.execute(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [quizId, studentId]
    );

    if (attempts[0].count >= quizData.max_attempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    res.json({
      success: true,
      data: {
        id: quizData.id,
        title: quizData.title || '',
        description: quizData.description || '',
        instructions: quizData.instructions || '',
        duration: quizData.duration_minutes || 0,
        questionCount: quizData.question_count || 0,
        totalMarks: quizData.total_marks || 0,
        shuffleQuestions: Boolean(quizData.shuffle_questions),
        shuffleAnswers: Boolean(quizData.shuffle_answers),
        courseName: quizData.course_name || '',
        teacherName: quizData.teacher_name || '',
        attemptsUsed: attempts[0].count || 0,
        maxAttempts: quizData.max_attempts || 1,
        endDateTime: quizData.end_datetime
      }
    });

  } catch (error) {
    console.error('Error fetching quiz for attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Start a new quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId, studentId } = req.body;

    if (!quizId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Student ID are required'
      });
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';

    // Get next attempt number
    const [attempts] = await pool.execute(
      'SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [quizId, studentId]
    );

    const attemptNumber = attempts[0].next_attempt || 1;

    // Create new attempt
    const [result] = await pool.execute(
      `INSERT INTO quiz_attempts (quiz_id, student_id, attempt_number, start_time, ip_address)
       VALUES (?, ?, ?, NOW(), ?)`,
      [quizId, studentId, attemptNumber, ipAddress]
    );

    // Log access
    await pool.execute(
      `INSERT INTO quiz_access_logs (quiz_id, student_id, action, ip_address)
       VALUES (?, ?, 'started', ?)`,
      [quizId, studentId, ipAddress]
    );

    res.json({
      success: true,
      data: {
        attemptId: result.insertId,
        attemptNumber: attemptNumber,
        startTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get quiz questions for an attempt
export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId, attemptId } = req.params;

    if (!quizId || !attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Attempt ID are required'
      });
    }

    // Verify attempt belongs to the quiz and student
    const [attemptCheck] = await pool.execute(
      'SELECT student_id FROM quiz_attempts WHERE id = ? AND quiz_id = ?',
      [attemptId, quizId]
    );

    if (attemptCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid attempt'
      });
    }

    // Get quiz settings
    const [quizSettings] = await pool.execute(
      'SELECT shuffle_questions, shuffle_answers FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get questions
    let questionQuery = `
      SELECT id, question_type, question_text, question_image, marks, order_index
      FROM quiz_questions 
      WHERE quiz_id = ?
    `;

    if (quizSettings[0].shuffle_questions) {
      questionQuery += ' ORDER BY RAND()';
    } else {
      questionQuery += ' ORDER BY order_index';
    }

    const [questions] = await pool.execute(questionQuery, [quizId]);

    // Get options and drag-drop items for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        if (question.question_type === 'mcq') {
          let optionQuery = `
            SELECT id, option_text, option_image, order_index
            FROM question_options 
            WHERE question_id = ?
          `;

          if (quizSettings[0].shuffle_answers) {
            optionQuery += ' ORDER BY RAND()';
          } else {
            optionQuery += ' ORDER BY order_index';
          }

          const [options] = await pool.execute(optionQuery, [question.id]);
          question.options = options || [];
        } else if (question.question_type === 'drag_drop') {
          const [dragItems] = await pool.execute(
            'SELECT item_text, target_text, match_id, order_index FROM drag_drop_items WHERE question_id = ? ORDER BY order_index',
            [question.id]
          );
          question.dragItems = dragItems || [];
        }

        return question;
      })
    );

    res.json({
      success: true,
      data: questionsWithOptions
    });

  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Submit quiz answer
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, answer, timeSpent } = req.body;

    if (!attemptId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID and Question ID are required'
      });
    }

    // Check if answer already exists
    const [existingAnswer] = await pool.execute(
      'SELECT id FROM student_answers WHERE attempt_id = ? AND question_id = ?',
      [attemptId, questionId]
    );

    const answerText = answer?.text || null;
    const optionId = answer?.optionId || null;
    const dragMatches = answer?.dragMatches ? JSON.stringify(answer.dragMatches) : null;
    const timeSpentSeconds = Number(timeSpent) || 0;

    if (existingAnswer.length > 0) {
      // Update existing answer
      await pool.execute(
        `UPDATE student_answers 
         SET answer_text = ?, selected_option_id = ?, drag_drop_matches = ?, time_spent_seconds = ?, updated_at = NOW()
         WHERE attempt_id = ? AND question_id = ?`,
        [answerText, optionId, dragMatches, timeSpentSeconds, attemptId, questionId]
      );
    } else {
      // Insert new answer
      await pool.execute(
        `INSERT INTO student_answers (attempt_id, question_id, answer_text, selected_option_id, drag_drop_matches, time_spent_seconds)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attemptId, questionId, answerText, optionId, dragMatches, timeSpentSeconds]
      );
    }

    res.json({
      success: true,
      message: 'Answer saved successfully'
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save answer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Calculate quiz score (helper function)
export const calculateQuizScore = async (attemptId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get all student answers for this attempt
    const [answers] = await connection.execute(
      `SELECT sa.*, qq.question_type, qq.marks, qq.correct_answer
       FROM student_answers sa
       JOIN quiz_questions qq ON sa.question_id = qq.id
       WHERE sa.attempt_id = ?`,
      [attemptId]
    );

    let totalMarksObtained = 0;

    for (const answer of answers) {
      let marksObtained = 0;
      let isCorrect = false;

      if (answer.question_type === 'mcq') {
        // Check if selected option is correct
        if (answer.selected_option_id) {
          const [correctOption] = await connection.execute(
            'SELECT is_correct FROM question_options WHERE id = ?',
            [answer.selected_option_id]
          );
          
          if (correctOption.length > 0 && correctOption[0].is_correct) {
            marksObtained = answer.marks;
            isCorrect = true;
          }
        }
      } else if (answer.question_type === 'short_answer') {
        // Simple text comparison (can be enhanced)
        if (answer.answer_text && answer.correct_answer) {
          const studentAnswer = answer.answer_text.toLowerCase().trim();
          const correctAnswer = answer.correct_answer.toLowerCase().trim();
          if (studentAnswer === correctAnswer) {
            marksObtained = answer.marks;
            isCorrect = true;
          }
        }
      } else if (answer.question_type === 'drag_drop') {
        // Check drag and drop matches
        try {
          const dragMatches = JSON.parse(answer.drag_drop_matches || '{}');
          const [correctMatches] = await connection.execute(
            'SELECT item_text, target_text FROM drag_drop_items WHERE question_id = ?',
            [answer.question_id]
          );
          
          let correctCount = 0;
          for (const match of correctMatches) {
            if (dragMatches[match.target_text] === match.item_text) {
              correctCount++;
            }
          }
          
          if (correctCount === correctMatches.length && correctMatches.length > 0) {
            marksObtained = answer.marks;
            isCorrect = true;
          }
        } catch (e) {
          console.error('Error parsing drag drop matches:', e);
        }
      }

      // Update student answer with marks
      await connection.execute(
        'UPDATE student_answers SET marks_obtained = ?, is_correct = ? WHERE id = ?',
        [marksObtained, isCorrect, answer.id]
      );

      totalMarksObtained += marksObtained;
    }

    // Get total possible marks
    const [quizInfo] = await connection.execute(
      `SELECT q.total_marks, q.passing_marks 
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.id = ?`,
      [attemptId]
    );

    if (quizInfo.length === 0) {
      throw new Error('Quiz not found for attempt');
    }

    const totalMarks = quizInfo[0].total_marks || 1; // Prevent division by zero
    const percentage = (totalMarksObtained / totalMarks) * 100;
    const isPassed = totalMarksObtained >= (quizInfo[0].passing_marks || 0);

    // Update attempt with final scores
    await connection.execute(
      `UPDATE quiz_attempts 
       SET total_marks_obtained = ?, percentage = ?, is_passed = ?
       WHERE id = ?`,
      [totalMarksObtained, percentage, isPassed, attemptId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Submit entire quiz
export const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeSpent } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required'
      });
    }

    // Get attempt details
    const [attempt] = await pool.execute(
      'SELECT quiz_id, student_id FROM quiz_attempts WHERE id = ?',
      [attemptId]
    );

    if (attempt.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Calculate scores
    await calculateQuizScore(attemptId);

    // Update attempt status
    const timeSpentSeconds = Number(timeSpent) || 0;
    await pool.execute(
      `UPDATE quiz_attempts 
       SET end_time = NOW(), time_spent_seconds = ?, status = 'completed', updated_at = NOW()
       WHERE id = ?`,
      [timeSpentSeconds, attemptId]
    );

    // Log submission
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    await pool.execute(
      `INSERT INTO quiz_access_logs (quiz_id, student_id, action, ip_address)
       VALUES (?, ?, 'submitted', ?)`,
      [attempt[0].quiz_id, attempt[0].student_id, ipAddress]
    );

    res.json({
      success: true,
      message: 'Quiz submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get quiz results
export const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required'
      });
    }

    const [attempt] = await pool.execute(
      `SELECT qa.*, q.title, q.total_marks, q.passing_marks, q.show_results, q.review_enabled,
       c.course_name, t.fname
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN course c ON q.course_id = c.course_id
       JOIN teacher t ON q.teacher_id = t.teacher_id
       WHERE qa.id = ?`,
      [attemptId]
    );

    if (attempt.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    const attemptData = attempt[0];

    if (!attemptData.show_results) {
      return res.status(403).json({
        success: false,
        message: 'Results not available for this quiz'
      });
    }

    const result = {
      attemptId: attemptData.id,
      quizTitle: attemptData.title || '',
      courseName: attemptData.course_name || '',
      teacherName: attemptData.fname || '',
      score: attemptData.total_marks_obtained || 0,
      totalMarks: attemptData.total_marks || 0,
      percentage: attemptData.percentage || 0,
      passed: Boolean(attemptData.is_passed),
      passingMarks: attemptData.passing_marks || 0,
      timeSpent: attemptData.time_spent_seconds || 0,
      reviewEnabled: Boolean(attemptData.review_enabled),
      submittedAt: attemptData.updated_at
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getQuizReview = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required'
      });
    }

    // Get attempt details and check if review is enabled
    const [attempt] = await pool.execute(
      `SELECT qa.*, q.title, q.review_enabled, q.show_results
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.id = ? AND qa.status = 'completed'`,
      [attemptId]
    );

    if (attempt.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found or not completed'
      });
    }

    const attemptData = attempt[0];

    if (!attemptData.review_enabled) {
      return res.status(403).json({
        success: false,
        message: 'Review is not enabled for this quiz'
      });
    }

    // Get all questions with student answers
    const [questionsWithAnswers] = await pool.execute(
      `SELECT 
        qq.id,
        qq.question_type,
        qq.question_text,
        qq.question_image,
        qq.marks,
        qq.order_index,
        qq.explanation,
        qq.correct_answer,
        qq.difficulty,
        sa.answer_text,
        sa.selected_option_id,
        sa.drag_drop_matches,
        sa.marks_obtained,
        sa.is_correct,
        sa.time_spent_seconds
       FROM quiz_questions qq
       LEFT JOIN student_answers sa ON qq.id = sa.question_id AND sa.attempt_id = ?
       WHERE qq.quiz_id = ?
       ORDER BY qq.order_index`,
      [attemptId, attemptData.quiz_id]
    );

    // Process questions and get options for MCQ questions
    const questionsWithOptions = await Promise.all(
      questionsWithAnswers.map(async (question) => {
        const questionData = {
          id: question.id,
          type: question.question_type,
          questionText: question.question_text,
          questionImage: question.question_image,
          marks: question.marks,
          marksObtained: question.marks_obtained || 0,
          isCorrect: Boolean(question.is_correct),
          userAnswer: question.answer_text,
          correctAnswer: question.correct_answer,
          timeSpent: question.time_spent_seconds || 0,
          explanation: question.explanation,
          difficulty: question.difficulty || 'Medium'
        };

        // Get options for MCQ questions
        if (question.question_type === 'mcq') {
          const [options] = await pool.execute(
            `SELECT id, option_text, option_image, is_correct, order_index
             FROM question_options 
             WHERE question_id = ?
             ORDER BY order_index`,
            [question.id]
          );

          questionData.options = options.map(option => ({
            id: option.id,
            text: option.option_text,
            image: option.option_image,
            isCorrect: Boolean(option.is_correct)
          }));

          // FIXED: Set user selected option ID and correct answer TEXT
          questionData.userAnswer = question.selected_option_id;
          
          // Get the correct option text(s) instead of ID
          const correctOptions = options.filter(opt => opt.is_correct);
          questionData.correctAnswer = correctOptions.length > 0 
            ? correctOptions.map(opt => opt.option_text).join(', ')
            : null;
        }

        // Handle short answer questions - keep existing logic
        if (question.question_type === 'short_answer') {
          questionData.userAnswer = question.answer_text;
          questionData.correctAnswer = question.correct_answer;
        }

        // Handle drag and drop questions
        if (question.question_type === 'drag_drop') {
          try {
            const dragMatches = JSON.parse(question.drag_drop_matches || '{}');
            const [correctMatches] = await pool.execute(
              'SELECT item_text, target_text FROM drag_drop_items WHERE question_id = ?',
              [question.id]
            );
            
            let correctCount = 0;
            for (const match of correctMatches) {
              if (dragMatches[match.target_text] === match.item_text) {
                correctCount++;
              }
            }
            
            questionData.correctMatches = correctCount;
            questionData.totalMatches = correctMatches.length;
            questionData.dragMatches = dragMatches;
            
            // FIXED: Set correct answer for drag & drop as readable text
            questionData.correctAnswer = correctMatches.length > 0 
              ? correctMatches.map(match => `${match.item_text} → ${match.target_text}`).join('; ')
              : null;
              
            // Set user answer as a description
            questionData.userAnswer = Object.keys(dragMatches).length > 0 
              ? 'Drag & drop matches recorded'
              : 'No matches recorded';
        } catch (e) {
            console.error('Error parsing drag drop matches:', e);
            questionData.correctMatches = 0;
            questionData.totalMatches = 0;
            questionData.correctAnswer = 'Error loading correct matches';
            questionData.userAnswer = 'Error loading user matches';
          }
        }

        return questionData;
      })
    );

    // Calculate performance statistics
    const totalQuestions = questionsWithAnswers.length;
    const correctAnswers = questionsWithAnswers.filter(q => q.is_correct).length;
    const totalTimeSpent = questionsWithAnswers.reduce((sum, q) => sum + (q.time_spent_seconds || 0), 0);

    // Group by question type
    const categoryPerformance = {};
    const difficultyBreakdown = {};

    questionsWithAnswers.forEach(q => {
      const type = q.question_type;
      const difficulty = q.difficulty || 'Medium';

      // Category performance
      if (!categoryPerformance[type]) {
        categoryPerformance[type] = { total: 0, correct: 0 };
      }
      categoryPerformance[type].total++;
      if (q.is_correct) categoryPerformance[type].correct++;

      // Difficulty breakdown
      if (!difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty] = { total: 0, correct: 0 };
      }
      difficultyBreakdown[difficulty].total++;
      if (q.is_correct) difficultyBreakdown[difficulty].correct++;
    });

    // Format performance data
    const categoryStats = Object.entries(categoryPerformance).map(([category, stats]) => ({
      category: category.replace('_', ' ').toUpperCase(),
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));

    const difficultyStats = Object.entries(difficultyBreakdown).map(([difficulty, stats]) => ({
      difficulty,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));

    const reviewData = {
      attemptId: attemptData.id,
      quizTitle: attemptData.title,
      questions: questionsWithOptions,
      statistics: {
        totalQuestions,
        correctAnswers,
        totalTimeSpent,
        accuracy: Math.round((correctAnswers / totalQuestions) * 100)
      },
      categoryPerformance: categoryStats,
      difficultyBreakdown: difficultyStats
    };

    res.json({
      success: true,
      data: reviewData
    });

  } catch (error) {
    console.error('Error fetching quiz review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
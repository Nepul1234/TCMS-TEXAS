import pool from '../utils/dbconn.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Create a new quiz
 * POST /api/teacher/quizzes
 */
export const createQuiz = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      title,
      description,
      courseId,
      duration,
      instructions,
      difficulty = 'Medium',
      password,
      show_results = true,
      shuffle_questions = false,
      review_enabled = true,
      shuffle_answers = false,
      max_attempts = 1,
      passing_marks = 0,
      start_datetime,
      end_datetime,
      auto_submit = true,
      questions
    } = req.body;

    // Validation
    if (!title || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, course ID, and at least one question are required'
      });
    }

    // Verify teacher has access to the course
    const [courseCheck] = await connection.execute(
      `SELECT tc.id FROM teacher_courses tc 
       WHERE tc.teacher_id = ? AND tc.course_id = ?`,
      [req.user.id, courseId]
    );

    if (courseCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    }

    // Calculate total marks and question count
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const questionCount = questions.length;

    // Insert quiz
    const [quizResult] = await connection.execute(
      `INSERT INTO quizzes (
        course_id, teacher_id, title, description, instructions,
        total_marks, question_count, duration_minutes, password,
        shuffle_questions, shuffle_answers, show_results, review_enabled,
        max_attempts, passing_marks, difficulty, status,
        start_datetime, end_datetime, auto_submit,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        courseId, req.user.id, title, description,
        instructions || 'Answer all questions carefully. You can navigate between questions freely.',
        totalMarks, questionCount, duration, password,
        shuffle_questions, shuffle_answers, show_results, review_enabled,
        max_attempts, passing_marks, difficulty, 'draft',
        start_datetime, end_datetime, auto_submit
      ]
    );

    const quizId = quizResult.insertId;

    // Process questions
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      
      // Validate question type
      if (!['mcq', 'short_answer', 'drag_drop'].includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }

      // Insert question
      const [questionResult] = await connection.execute(
        `INSERT INTO quiz_questions (
          quiz_id, question_type, question_text, marks, difficulty,
          order_index, explanation, correct_answer, is_case_sensitive,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          quizId,
          question.type,
          question.questionText,
          question.marks || 1,
          question.difficulty || 'Medium',
          index + 1,
          question.explanation || null,
          question.type === 'short_answer' ? question.correctAnswer : null,
          question.isCaseSensitive || false
        ]
      );

      const questionId = questionResult.insertId;

      // Handle MCQ options
      if (question.type === 'mcq' && question.options) {
        if (question.options.length < 2) {
          throw new Error(`Question ${index + 1} must have at least 2 options`);
        }

        let hasCorrectAnswer = false;
        
        for (let optionIndex = 0; optionIndex < question.options.length; optionIndex++) {
          const option = question.options[optionIndex];
          
          if (option.isCorrect) {
            hasCorrectAnswer = true;
          }

          await connection.execute(
            `INSERT INTO question_options (
              question_id, option_text, is_correct, order_index, created_at
            ) VALUES (?, ?, ?, ?, NOW())`,
            [questionId, option.text, option.isCorrect, optionIndex + 1]
          );
        }

        if (!hasCorrectAnswer) {
          throw new Error(`Question ${index + 1} must have at least one correct answer`);
        }
      }

      // Handle drag drop items
      if (question.type === 'drag_drop' && question.dragDropItems) {
        if (question.dragDropItems.length < 2) {
          throw new Error(`Question ${index + 1} must have at least 2 drag-drop pairs`);
        }

        for (let itemIndex = 0; itemIndex < question.dragDropItems.length; itemIndex++) {
          const item = question.dragDropItems[itemIndex];
          
          await connection.execute(
            `INSERT INTO drag_drop_items (
              question_id, item_text, target_text, match_id, order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())`,
            [questionId, item.itemText, item.targetText, itemIndex + 1, itemIndex + 1]
          );
        }
      }

      // Validate short answer
      if (question.type === 'short_answer' && !question.correctAnswer) {
        throw new Error(`Question ${index + 1} must have a correct answer`);
      }
    }

    await connection.commit();

    // Fetch the created quiz with details
    const createdQuiz = await getQuizDetails(quizId, connection);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quizId: quizId,
        quiz: createdQuiz
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating quiz:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create quiz'
    });
  } finally {
    connection.release();
  }
};

/**
 * Update an existing quiz
 * PUT /api/teacher/quizzes/:id
 */
export const updateQuiz = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const quizId = req.params.id;
    const {
      title,
      description,
      courseId,
      duration,
      instructions,
      difficulty = 'Medium',
      password,
      show_results = true,
      shuffle_questions = false,
      review_enabled = true,
      shuffle_answers = false,
      max_attempts = 1,
      passing_marks = 0,
      start_datetime,
      end_datetime,
      auto_submit = true,
      questions
    } = req.body;

    // Check if quiz exists and belongs to teacher
    const [quizCheck] = await connection.execute(
      'SELECT id, status FROM quizzes WHERE id = ? AND teacher_id = ?',
      [quizId, req.user.id]
    );

    if (quizCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or you do not have permission to edit it'
      });
    }

    // Validation
    if (!title || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, course ID, and at least one question are required'
      });
    }

    // Calculate total marks and question count
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const questionCount = questions.length;

    // Update quiz
    await connection.execute(
      `UPDATE quizzes SET 
        course_id = ?, title = ?, description = ?, instructions = ?,
        total_marks = ?, question_count = ?, duration_minutes = ?, password = ?,
        shuffle_questions = ?, shuffle_answers = ?, show_results = ?, review_enabled = ?,
        max_attempts = ?, passing_marks = ?, difficulty = ?,
        start_datetime = ?, end_datetime = ?, auto_submit = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        courseId, title, description,
        instructions || 'Answer all questions carefully. You can navigate between questions freely.',
        totalMarks, questionCount, duration, password|| null,
        shuffle_questions, shuffle_answers, show_results, review_enabled,
        max_attempts, passing_marks, difficulty,
        start_datetime, end_datetime, auto_submit,
        quizId
      ]
    );

    // Delete existing questions and related data
    const [existingQuestions] = await connection.execute(
      'SELECT id FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );

    if (existingQuestions.length > 0) {
      const questionIds = existingQuestions.map(q => q.id);
      const placeholders = questionIds.map(() => '?').join(',');
      
      await connection.execute(
        `DELETE FROM question_options WHERE question_id IN (${placeholders})`,
        questionIds
      );
      
      await connection.execute(
        `DELETE FROM drag_drop_items WHERE question_id IN (${placeholders})`,
        questionIds
      );
      
      await connection.execute(
        'DELETE FROM quiz_questions WHERE quiz_id = ?',
        [quizId]
      );
    }

    // Add new questions (same logic as create)
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      
      // Insert question
      const [questionResult] = await connection.execute(
        `INSERT INTO quiz_questions (
          quiz_id, question_type, question_text, marks, difficulty,
          order_index, explanation, correct_answer, is_case_sensitive,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          quizId,
          question.type,
          question.questionText,
          question.marks || 1,
          question.difficulty || 'Medium',
          index + 1,
          question.explanation || null,
          question.type === 'short_answer' ? question.correctAnswer : null,
          question.isCaseSensitive || false
        ]
      );

      const questionId = questionResult.insertId;

      // Handle MCQ options
      if (question.type === 'mcq' && question.options) {
        let hasCorrectAnswer = false;
        
        for (let optionIndex = 0; optionIndex < question.options.length; optionIndex++) {
          const option = question.options[optionIndex];
          
          if (option.isCorrect) {
            hasCorrectAnswer = true;
          }

          await connection.execute(
            `INSERT INTO question_options (
              question_id, option_text, is_correct, order_index, created_at
            ) VALUES (?, ?, ?, ?, NOW())`,
            [questionId, option.text, option.isCorrect, optionIndex + 1]
          );
        }

        if (!hasCorrectAnswer) {
          throw new Error(`Question ${index + 1} must have at least one correct answer`);
        }
      }

      // Handle drag drop items
      if (question.type === 'drag_drop' && question.dragDropItems) {
        for (let itemIndex = 0; itemIndex < question.dragDropItems.length; itemIndex++) {
          const item = question.dragDropItems[itemIndex];
          
          await connection.execute(
            `INSERT INTO drag_drop_items (
              question_id, item_text, target_text, match_id, order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())`,
            [questionId, item.itemText, item.targetText, itemIndex + 1, itemIndex + 1]
          );
        }
      }
    }

    await connection.commit();

    // Fetch updated quiz
    const updatedQuiz = await getQuizDetails(quizId, connection);

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        quiz: updatedQuiz
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating quiz:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update quiz'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get quiz details
 * GET /api/teacher/quizzes/:id
 */
export const getQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await getQuizDetails(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};

/**
 * Get all quizzes for teacher
 * GET /api/teacher/quizzes
 */
export const getTeacherQuizzes = async (req, res) => {
  try {
    const [quizzes] = await pool.execute(
      `SELECT q.*, c.course_name as course_name, c.course_id as course_code
       FROM quizzes q
       JOIN course c ON q.course_id = c.course_id
       WHERE q.teacher_id = ?
       ORDER BY q.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};

/**
 * Publish a quiz
 * PATCH /api/teacher/quizzes/:id/publish
 */
export const publishQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    // Check if quiz exists and belongs to teacher
    const [quizCheck] = await pool.execute(
      'SELECT id, question_count FROM quizzes WHERE id = ? AND teacher_id = ?',
      [quizId, req.user.id]
    );

    if (quizCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quizCheck[0].question_count === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish quiz without questions'
      });
    }

    // Update status to published
    await pool.execute(
      'UPDATE quizzes SET status = ?, updated_at = NOW() WHERE id = ?',
      ['published', quizId]
    );

    res.json({
      success: true,
      message: 'Quiz published successfully'
    });

  } catch (error) {
    console.error('Error publishing quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish quiz'
    });
  }
};

/**
 * Delete a quiz
 * DELETE /api/teacher/quizzes/:id
 */
export const deleteQuiz = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const quizId = req.params.id;

    // Check if quiz exists and belongs to teacher
    const [quizCheck] = await connection.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [quizId, req.user.id]
    );

    if (quizCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Delete in correct order due to foreign key constraints
    const [questions] = await connection.execute(
      'SELECT id FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );

    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      const placeholders = questionIds.map(() => '?').join(',');
      
      await connection.execute(
        `DELETE FROM question_options WHERE question_id IN (${placeholders})`,
        questionIds
      );
      
      await connection.execute(
        `DELETE FROM drag_drop_items WHERE question_id IN (${placeholders})`,
        questionIds
      );
    }

    await connection.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    await connection.execute('DELETE FROM quizzes WHERE id = ?', [quizId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting quiz:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get courses for teacher
 * GET /api/teacher/courses
 */
export const getTeacherCourses = async (req, res) => {
  try {
    const [courses] = await pool.execute(
      `SELECT c.course_id, c.course_name
       FROM course c
       JOIN teacher_courses tc ON c.course_id = tc.course_id
       WHERE tc.teacher_id = ?
       ORDER BY c.course_name`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

/**
 * Helper method to get complete quiz details
 */
export const getQuizDetails = async (quizId, connection = null) => {
  const conn = connection || pool;
  
  try {
    // Get quiz basic info
    const [quizResult] = await conn.execute(
      `SELECT q.*, c.course_name as course_name, c.course_id as course_code
       FROM quizzes q
       JOIN course c ON q.course_id = c.course_id
       WHERE q.id = ?`,
      [quizId]
    );

    if (quizResult.length === 0) {
      return null;
    }

    const quiz = quizResult[0];

    // Get questions
    const [questions] = await conn.execute(
      `SELECT * FROM quiz_questions 
       WHERE quiz_id = ? 
       ORDER BY order_index`,
      [quizId]
    );

    // Get options and drag-drop items for each question
    for (const question of questions) {
      if (question.question_type === 'mcq') {
        const [options] = await conn.execute(
          `SELECT * FROM question_options 
           WHERE question_id = ? 
           ORDER BY order_index`,
          [question.id]
        );
        question.options = options;
      } else if (question.question_type === 'drag_drop') {
        const [dragDropItems] = await conn.execute(
          `SELECT * FROM drag_drop_items 
           WHERE question_id = ? 
           ORDER BY order_index`,
          [question.id]
        );
        question.dragDropItems = dragDropItems;
      }
    }

    quiz.questions = questions;
    return quiz;

  } catch (error) {
    console.error('Error getting quiz details:', error);
    throw error;
  }
};

export const archiveQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    // Check if quiz exists and belongs to teacher
    const [quizCheck] = await pool.execute(
      'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
      [quizId, req.user.id]
    );

    if (quizCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Update status to archived
    await pool.execute(
      'UPDATE quizzes SET status = ?, updated_at = NOW() WHERE id = ?',
      ['archived', quizId]
    );

    res.json({
      success: true,
      message: 'Quiz archived successfully'
    });

  } catch (error) {
    console.error('Error archiving quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive quiz'
    });
  }
};
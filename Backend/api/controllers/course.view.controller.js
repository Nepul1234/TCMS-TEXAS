import errorHandler from "../utils/error.js";
import pool from '../utils/dbconn.js';

export const getCourseView = async (req, res, next) => {
    try {
        const [courseView] = await pool.query('SELECT c.course_id, c.course_name, c.course_type, c.grade, c.Fees, t.fname, t.lname FROM course c JOIN teacher t ON c.t_id = t.teacher_id');
        if (courseView.length === 0) {
            return next(errorHandler(404, 'No courses found'));
        }
        res.json(courseView);
    }
    catch (error) {
        next(error);
    }
};

export const enrollCourseRequest = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    // Validate required fields
    if (!student_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }

    // Check if enrollment request already exists
    const checkQuery = `
      SELECT COUNT(*) as count FROM course_enrollment_requests 
      WHERE student_id = ? AND course_id = ?
    `;
    
    const [rows] = await pool.query(checkQuery, [student_id, course_id]);
    const existingCount = rows[0].count;
    
    if (existingCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Enrollment request already exists for this course'
      });
    }

    // Insert new enrollment request
    const insertQuery = `
      INSERT INTO course_enrollment_requests (student_id, course_id, request_date)
      VALUES (?, ?, CURDATE())
    `;
    
    const [result] = await pool.query(insertQuery, [student_id, course_id]);
    
    if (result.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: 'Enrollment request submitted successfully',
        data: {
          student_id,
          course_id,
          request_date: new Date().toISOString()
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to submit enrollment request'
      });
    }

  } catch (error) {
    console.error('Error in enrollCourseRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


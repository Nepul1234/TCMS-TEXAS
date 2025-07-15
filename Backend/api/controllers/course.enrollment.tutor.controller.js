import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getAllCourseEnrollments = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `SELECT 
        s.stu_id,
        CONCAT(s.Fname, ' ', s.Lname) AS full_name,
        GROUP_CONCAT(CONCAT(c.course_id, ' - ', c.course_name) ORDER BY c.course_id SEPARATOR ', ') AS enrolled_courses
      FROM 
        student s
      JOIN 
        course_enrollment ce ON s.stu_id = ce.stu_id
      JOIN 
        course c ON ce.course_id = c.course_id
      GROUP BY 
        s.stu_id, full_name
      ORDER BY 
        s.stu_id`
    );

    if (result.length === 0) {
      return next(errorHandler(404, 'No course enrollments found'));
    }

    res.json({ 
      enrollmentData: result 
    });
  } catch (error) {
    next(error);
  }
};

// Alternative version if you want separate course details array
export const getAllCourseEnrollmentsDetailed = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `SELECT 
        s.stu_id,
        CONCAT(s.Fname, ' ', s.Lname) AS full_name,
        c.course_id,
        c.course_name,
        c.credits,
        c.description
      FROM 
        student s
      JOIN 
        course_enrollment ce ON s.stu_id = ce.stu_id
      JOIN 
        course c ON ce.course_id = c.course_id
      ORDER BY 
        s.stu_id, c.course_id`
    );

    if (result.length === 0) {
      return next(errorHandler(404, 'No course enrollments found'));
    }

    res.json({ 
      enrollmentData: result 
    });
  } catch (error) {
    next(error);
  }
};
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getTutorEnrolledCourses = async (req, res, next) => {
  const { teacher_id } = req.body; // Getting teacher_id from request body
  
  try {
    // Validate that teacher_id is provided
    if (!teacher_id) {
      return next(errorHandler(400, "Teacher ID is required"));
    }

    // Query to get courses for the teacher from teacher_courses table
    // This will get all course_ids for the given teacher
    const [courseRows] = await pool.query(
      "SELECT course_id FROM teacher_courses WHERE teacher_id = ?", 
      [teacher_id]
    );

    if (courseRows.length === 0) {
      return next(errorHandler(404, "No courses found for this teacher"));
    }

    // Extract course IDs
    const courseIds = courseRows.map(row => row.course_id);

    // Get full course details from course table
    const placeholders = courseIds.map(() => '?').join(',');
    const [courseDetails] = await pool.query(
      `SELECT * FROM course WHERE course_id IN (${placeholders})`,
      courseIds
    );

    res.status(200).json(courseDetails);
  } catch (error) {
    next(error);
  }
};

// Alternative simpler version if   want course IDs
export const getTutorCourseIds = async (req, res, next) => {
  const { teacher_id } = req.body;
  
  try {
    if (!teacher_id) {
      return next(errorHandler(400, "Teacher ID is required"));
    }

    const [rows] = await pool.query(
      "SELECT * FROM teacher_courses WHERE teacher_id = ?", 
      [teacher_id]
    );

    if (rows.length === 0) {
      return next(errorHandler(404, "No courses found for this teacher"));
    }

    res.status(200).json({data});
  } catch (error) {
    next(error);
  }
}
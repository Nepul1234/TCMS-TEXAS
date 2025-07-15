import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getTutorDashboardData = async (req, res, next) => { 
  try {
    // Run both queries together in a single request
    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM student) AS student_count,
        (SELECT COUNT(*) FROM teacher) AS tutor_count,
        (SELECT COUNT(*) 
         FROM student 
         WHERE MONTH(Enroll_date) = MONTH(CURRENT_DATE()) 
         AND YEAR(Enroll_date) = YEAR(CURRENT_DATE())
        ) AS students_joined_this_month
    `);

    if (rows.length === 0) {
      return next(errorHandler(404, "No data found for the tutor dashboard"));
    }

    // Return the dashboard data
    res.status(200).json(rows[0]);  // return the single object directly
  } catch (error) {
    next(error);
  }
}

export const getNewlyJoinedStudents = async (req, res, next) => {
    try {
        // Query to get current month enrollments
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS current_month_enrollments
            FROM student
            WHERE MONTH(Enroll_date) = MONTH(CURDATE()) 
                AND YEAR(Enroll_date) = YEAR(CURDATE())
        `);

        if (rows.length === 0) {
            return next(errorHandler(404, "No enrollment data found"));
        }

        // Return the enrollment count
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
}

export const getUpcommingVirtualClasses = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM virtual_classes
      WHERE status = 'upcoming'
      ORDER BY class_date ASC, class_time ASC
    `);

    if (rows.length === 0) {
      return next(errorHandler(404, "No upcoming classes found"));
    }

    // ✅ Return all upcoming classes
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}
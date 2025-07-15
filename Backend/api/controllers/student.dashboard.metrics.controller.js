import pool from '../utils/dbconn.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

// Middleware to verify token and extract user info
const verifyTokenAndGetUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Token expired'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = decoded;
    next();
  });
};

export { verifyTokenAndGetUser };

// Get dashboard metrics
export const getDashboardMetrics = async (req, res) => {
  try {
    const id = req.user.id;

    let enrolledCoursesQuery;
    let enrolledCoursesParams = [];

    // Different queries based on user role
      // For students: get their enrolled courses count
      enrolledCoursesQuery = `
        SELECT COUNT(*) as enrolled_courses 
        FROM course_enrollment 
        WHERE stu_id = ?
      `;
      enrolledCoursesParams = [id];
    
    // Get total students count
    const studentsQuery = `
      SELECT COUNT(*) as total_students 
      FROM student
    `;
    
    // Get total teachers count
    const teachersQuery = `
      SELECT COUNT(*) as total_teachers 
      FROM teacher
    `;

    // Execute all queries
    const [enrolledCoursesResult] = await pool.execute(enrolledCoursesQuery, enrolledCoursesParams);
    const [studentsResult] = await pool.execute(studentsQuery);
    const [teachersResult] = await pool.execute(teachersQuery);

    // Format the response
    const metrics = {
      enrolledCourses: enrolledCoursesResult[0].enrolled_courses || 0,
      totalStudents: studentsResult[0].total_students || 0,
      totalTeachers: teachersResult[0].total_teachers || 0,
      userRole: req.user.userRole || 'student', // Default to 'student' if role not provided
      userId: id
    };

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: error.message
    });
  }
};


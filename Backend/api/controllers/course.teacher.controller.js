import pool from '../utils/dbconn.js';


export const getCourses = async (req, res) => {
  try {
    // Get teacher ID from authenticated user (from middleware)
    const teacherId = req.user.teacher_id;
    
    // Direct SQL query - get teacher's courses with statistics
    const [rows] = await pool.execute(
  `SELECT c.*,
          COUNT(DISTINCT ce.e_id) as enrolled_students,
          COUNT(distinct cm.id) as total_materials,
          COUNT(Distinct CASE WHEN cm.material_type = 'assignment' THEN 1 END) as total_assignments
   FROM course c 
   LEFT JOIN course_enrollment ce ON c.course_id = ce.course_id
   LEFT JOIN course_materials cm ON c.course_id = cm.course_id AND cm.is_published = TRUE
   WHERE c.t_id = ? 
   GROUP BY c.course_id
   ORDER BY c.course_name ASC`,
  [teacherId]
);
    
    res.json({
      success: true,
      data: rows,
      message: `Found ${rows.length} course(s) for teacher`
    });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your courses',
      error: error.message
    });
  }
};

export default getCourses;
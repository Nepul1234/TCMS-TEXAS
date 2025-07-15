import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";


export const getAdminDashboardInfo = async (req, res, next) => {
    try {
        const [studentCount] = await pool.query('SELECT COUNT(*) AS student_count FROM student');
        const [teacherCount] = await pool.query('SELECT COUNT(*) AS teacher_count FROM teacher');
        const [courseCount] = await pool.query('SELECT COUNT(*) AS course_count FROM course');
        
        
        res.status(200).json({
            studentCount: studentCount[0].student_count,
            teacherCount: teacherCount[0].teacher_count,
            courseCount: courseCount[0].course_count,
            
        });
    } catch (error) {
        next(error);
    }
}



export const getMonthlyIncome = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT month_name, (total_income) AS total_income
      FROM monthly_income
      WHERE year = 2025
      ORDER BY FIELD(month_name,
        'January','February','March','April','May','June',
        'July','August','September','October','November','December')
    `);

    const incomeValues = rows.map(row => Number(row.total_income));

    res.status(200).json({ income: incomeValues });
  } catch (error) {
    console.error("Error fetching income data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";


export const getStudentProfileData = async (req, res, next) => {
    const { student_id } = req.body;
    try {
        console.log(student_id);
        const [student] = await pool.query('SELECT * FROM student WHERE stu_id = ?', [student_id]);
        if (student.length === 0) {
            return next(errorHandler(400, 'Student not found'));
        }
        res.json(student[0]);
    } catch (error) {
        next(error);
    }
}

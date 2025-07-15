import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getTutorEarnings = async (req, res) => {
    try {
        const query = `
            SELECT 
                sp.pay_id,
                sp.time,
                CONCAT(s.Fname, ' ', s.Lname) AS student_name,
                s.stu_id,
                s.Grade,
                c.course_name,
                c.course_id,
                sp.Amount,
                sp.month
            FROM 
                student_payments sp
            JOIN 
                student s ON sp.stu_id = s.stu_id
            JOIN 
                course c ON sp.course_id = c.course_id
        `;

        const [results] = await pool.execute(query);

        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error('Error fetching tutor earnings:', error);
        errorHandler(error, req, res);
    }
};
 
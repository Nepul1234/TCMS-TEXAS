import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getStudentPaymentDetails = async (req, res, next) => {
    const { student_id ,grade, teacher_name, course_type} = req.body;
    try {
        const gde = parseInt(grade, 10);
        const [courseid] = await pool.query(
            "SELECT course_id FROM course WHERE grade = ? AND course_type = ? AND t_id = (SELECT teacher_id FROM teacher WHERE fname = ? AND lname = ?)",
            [gde,course_type, teacher_name.split(' ')[0], teacher_name.split(' ')[1]]
        );
        if(courseid.length === 0){
            return next(errorHandler(400,"Course not found"));
        }
        const [studentPayments] = await pool.query(
            "SELECT sp.pay_id,sp.stu_id,sp.time,sp.payment_status,c.course_name,c.course_type,t.fname,t.lname FROM course c  JOIN student_payments sp ON c.course_id = sp.course_id JOIN teacher t ON t.teacher_id = c.t_id WHERE sp.stu_id = ? AND c.course_id = ?",[student_id,courseid[0]?.course_id]);
        
        if(studentPayments.length === 0) {
            return next(errorHandler(404, "No payment details found for this student"));
        }
        res.json(studentPayments);
        
    } catch (error) {
        next(error);
    }
}


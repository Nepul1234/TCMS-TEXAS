//student_payment_details_byId_controller.js( in controllers)
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";


export const getStudentPaymentDetailsById = async (req, res, next) => {
    const { id } = req.body;
    console.log(id);
    try {
        const [studentPaymentDetails] = await pool.query('SELECT c.course_name, sp.time, c.fees, sp.payment_status FROM student_payments sp JOIN course c ON sp.course_id = c.course_id WHERE sp.stu_id = ?', [id]);
        if (studentPaymentDetails.length === 0) {
            return next(errorHandler(404, 'No payment details found for this student'));
        }
        res.json({ studentPaymentDetails });
    } catch (error) {
        next(error);
    }

}






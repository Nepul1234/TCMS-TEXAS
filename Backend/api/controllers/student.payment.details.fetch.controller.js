import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const setStudentPaymentDetails = async (req, res, next) => {
    const { pay_id } = req.body;
    try {
        const payid = parseInt(pay_id, 10);
        const [studentPayments] = await pool.query(
             "UPDATE student_payments SET payment_status = 'Paid' WHERE pay_id = ?",[payid] );       
        if(studentPayments.length === 0) {
            return next(errorHandler(404, "Payment Update failed"));
        }
        res.json({message:"Payment Updated successfully"});
    
        
    } catch (error) {
        next(error);
    }
}


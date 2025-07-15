import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import { sendPaymentReceipt } from "../utils/emailService.js";

export const getStudentPaymentsDetails = async (req, res, next) => {
    const { student_id,course_id } = req.body;
    try {
        const [rows] = await pool.query('SELECT c.course_name,sp.pay_id, sp.time, c.fees, c.course_type, sp.payment_status, sp.month FROM student_payments sp JOIN course c ON sp.course_id = c.course_id WHERE sp.stu_id = ? AND sp.course_id = ?', [student_id,course_id]);
            if (rows.length === 0) {
                return next(errorHandler(404, 'No payment details found for this student'));
            }
            res.status(200).json({ rows });
        
    } catch (error) {
        next(error);
    }
}

export const setStudentPrevPaymentDetails = async (req, res, next) => {
    const {payment_id} = req.body;
    try{
        const [rows] = await pool.query('UPDATE student_payments SET payment_status = ?, time = NOW() WHERE pay_id = ?',["Paid", payment_id]  );
          if (rows.affectedRows === 0) {
            return next(errorHandler(404, 'No payment details found for this student'));
        }
        const [paymentDetails] = await pool.query('SELECT sp.stu_id, sp.course_id, sp.Amount FROM student_payments sp WHERE sp.pay_id = ?', [payment_id]);
        const student_id = paymentDetails[0]?.stu_id;
        const course_id = paymentDetails[0]?.course_id;
        const amount = paymentDetails[0]?.Amount;
        const [student] = await pool.query('SELECT Fname,Lname,Email FROM student WHERE stu_id = ?', [student_id]);
        if(student.length === 0){
            return next(errorHandler(404,'No student found to send the email'));
        }
        const [course_dat] = await pool.query('SELECT course_name,grade FROM course WHERE course_id = ?', [course_id]);
        const course_name = course_dat[0]?.course_name;
        const grade = course_dat[0]?.grade;
        const stu_email = student[0]?.Email;
        const stu_name = student[0]?.Fname + ' ' + student[0]?.Lname;
        await sendPaymentReceipt(stu_email,stu_name,amount,course_name,grade);

        res.status(200).json({ message: "Payment details added successfully" });
    }catch(error){
        next(error);
    }

};

export const setStudentPaymentDetails = async (req, res, next) => {
    const { student_id, course_id, amount} = req.body;
    try {
        const [test] = await pool.query('SELECT * FROM student_payments WHERE stu_id = ? AND course_id = ? AND month = MONTHNAME(CURDATE())', [student_id,course_id]);
        if (test.length > 0) {
            return next(errorHandler(404, 'This student is already paid for the current month'));
        }
        const [rows] = await pool.query('INSERT INTO student_payments (stu_id, course_id, month, time, payment_status,Amount) VALUES (?, ?, MONTHNAME(CURDATE()), NOW() ,?,?)', [student_id, course_id, "Paid", amount]);
        if(rows.length === 0) {
            return next(errorHandler(404, 'No payment added for this student'));
        }
        const [student] = await pool.query('SELECT Fname,Lname,Email FROM student WHERE stu_id = ?', [student_id]);
        if(student.length === 0){
            return next(errorHandler(404,'No student found to send the email'));
        }
        else{
          const [course_dat] = await pool.query('SELECT course_name,grade FROM course WHERE course_id = ?', [course_id]);
          const course_name = course_dat[0]?.course_name;
          const grade = course_dat[0]?.grade;
          const stu_email = student[0].Email;
          const stu_name = student[0].Fname + ' ' + student[0].Lname;
          await sendPaymentReceipt(stu_email,stu_name,amount,course_name,grade);
        }
        res.status(200).json({ message: "Payment details added successfully" });
    } catch (error) {
        next(error);
    }
}

import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import { sendAttendanceReceipt } from "../utils/emailService.js";

export const setStudentAttendance = async (req, res, next) => {
    const {student_id, course_id, session } = req.body;
    try{
        const [rows] = await pool.query("SELECT * FROM attendance WHERE stu_id = ? AND course_id = ? AND date = CURDATE()", [student_id, course_id]);
        if (rows.length > 0) {
            return next(errorHandler(400, 'Attendance for today already recorded'));
        }
        if(session === 'normal'){
             const [attendance] = await pool.query('SELECT * FROM attendance WHERE stu_id = ? AND course_id = ? AND session = (WEEK(CURDATE(), 1) - WEEK(DATE_SUB(CURDATE(), INTERVAL DAYOFMONTH(CURDATE()) - 1 DAY), 1) + 1) AND month = MONTHNAME(CURDATE())', [student_id, course_id]);
             const [data] = await pool.query("UPDATE attendance SET Date = CURDATE(), Status = 'Present' WHERE attend_id = ? ", [attendance[0].attend_id]);
             if(data.affectedRows === 0){
                 return next(errorHandler(500, 'Failed to update attendance record'));
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
                    await sendAttendanceReceipt(stu_email,stu_name,course_name,grade, new Date().toLocaleDateString(), new Date().toLocaleTimeString()); 
                }
         
                res.status(200).json({ message: "Attendance added successfully" });

        }
        else{
            res.status(200).json({ message: "Extra Attendace marked" });
        }

    }catch(error){
        next(error);
    }


}

export const getStudentAttendance = async (req, res, next) => {
    try{
        const [rows] = await pool.query("SELECT CONCAT(s.Fname,' ', s.Lname) AS student_name,a.attend_id AS id,a.stu_id AS student_id,a.course_id,a.session AS week,a.Date as date,a.Status as status, a.month,a.year, c.course_name, CONCAT(t.fname, ' ',t.lname) AS teacher_name FROM attendance a JOIN course c ON a.course_id = c.course_id JOIN teacher t ON t.teacher_id = c.t_id JOIN student s ON s.stu_id = a.stu_id WHERE date <= CURDATE()");
        if(rows.length < 0){
           return next(errorHandler(404, 'No attendace details found'));
        }
        res.status(200).json({attendanceDetails:rows});
    }catch(error){
       next(error);
    }
}
    
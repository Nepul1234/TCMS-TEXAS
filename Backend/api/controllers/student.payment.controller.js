import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const newStudentPayment = async (req, res, next) => {
  const { student_id, course_name, grade, teacher_name, course_type} = req.body;
  try {
    const [teacher] = await pool.query(
      "SELECT teacher_id FROM teacher WHERE fname = ? AND lname = ?",
      [teacher_name.split(' ')[0], teacher_name.split(' ')[1]]
    );
    if(teacher.length<0){
        return next(errorHandler(400,"Teacher not found"));
    }
    const teacherId = teacher[0]?.teacher_id;
    const [courseid] = await pool.query(
      "SELECT course_id FROM course WHERE course_name = ? AND grade = ? AND t_id = ? ",
      [course_name, grade, teacherId]
    );
    if(courseid.length<0){
        return next(errorHandler(400,"Course not found"));
    }
    const course_id = courseid[0]?.course_id;
    await pool.query("INSERT INTO student_payments (time,stu_id,course_id,payment_status) VALUES (NOW(),?,?,?)",[student_id,course_id,"Paid"]);
    res.json({message:"Payment added successfully"});
    
  } catch (error) {
    next(error);
  }
}


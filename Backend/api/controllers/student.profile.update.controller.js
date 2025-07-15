import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getStudentProfileUpdate = async (req, res, next) => {
    const { student_id, fname, lname, email, phone, profile_picture ,address} = req.body;
    const profilePictureBuffer = req.file?.buffer || null;

    try {
        const mobile = parseInt(phone,10);
        const [student] = await pool.query('SELECT * FROM student WHERE stu_id = ?', [student_id]);
        if (student.length === 0) {
            return next(errorHandler(400, 'Student not found'));
        }
        const updatedStudent = await pool.query('UPDATE student SET Fname = ?, Lname = ?, Email = ?, Tel_no = ?, Address =?, p_picture = ? WHERE stu_id = ?', [fname, lname, email, phone, address, profile_picture,student_id]);
        res.json({ message: 'Student profile updated successfully' });
      
    } catch (error) {
        next(error);
    }
}

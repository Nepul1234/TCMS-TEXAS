import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const registerNewCourse = async (req, res, next) => {
    const { cname, ctype, grade, tname, starting_t, ending_t, Fees, hall_alloc } = req.body;
    
    try {
        const gde = parseInt(grade, 10);
        const fees = parseInt(Fees);
        const [teacher_id] = await pool.query('SELECT teacher_id FROM teacher WHERE fname = ? AND lname = ?', [tname.split(' ')[0], tname.split(' ')[1]]);
        const teacherId = teacher_id[0]?.teacher_id;
        const [existingCourse] = await pool.query('SELECT * FROM course WHERE course_name = ? AND t_id = ?', [cname, teacherId]);
        
        if (existingCourse.length > 0) {
            return next(errorHandler(400, 'Course already exists'));
        }

        // Inserting the new course into the database
        await pool.query('INSERT INTO course (course_name,grade,start_time,end_time,t_id,course_type,Fees) VALUES (?, ?, ?, ?, ?, ?, ?)', [cname, gde, starting_t, ending_t, teacherId, ctype, fees]);
        
        res.json({ message: 'Course registered successfully', courseName: cname });
    } catch (error) {
        next(error);
    }
}

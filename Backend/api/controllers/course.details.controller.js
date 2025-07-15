import errorHandler from "../utils/error.js";
import pool from '../database/db.js';

const getCourseDetails = async (req, res, next) => {
    try {
        const [courseDetailsView] = await pool.query('SELECT c.course_name, c.course_type, c.grade, c.Fees, t.fname, t.lname FROM course c JOIN teacher t ON c.t_id = t.teacher_id');
        if (courseDetailsView.length === 0) {
            return next(errorHandler(404, 'No courses found'));
        }
        res.json(courseDetailsView);
    }
    catch (error) {
        next(error);
    }
}


    
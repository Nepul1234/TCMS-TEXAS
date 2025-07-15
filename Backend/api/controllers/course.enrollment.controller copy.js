import errorHandler from "../utils/error.js";
import pool from '../utils/dbconn.js';

export const getCourseEnrollmentByID = async (req, res, next) => {
    const { student_id } = req.body;
    try {
        const [enrollment] = await pool.query('SELECT * FROM course_enrollment WHERE stu_id = ?', [student_id]);
        if (enrollment.length === 0) {
            return next(errorHandler(404, 'No course enrollment found for this student'));
        }
        const courseDetails = [];
        for (const enroll of enrollment) {
            const [course] = await pool.query('SELECT * FROM course WHERE course_id = ?', [enroll.course_id]);
            if (course.length === 0) {
            return next(errorHandler(404, `No course details found for course_id: ${enroll.course_id}`));
            }
            courseDetails.push(course[0]);
        }
        res.json({ courseDetails });
    } catch (error) {
        next(error);
    }
}

export const getStudentEnrolledCourseCount = async (req, res, next) => {
    const { student_id } = req.body;
    
    try {
        if (!student_id) {
            return next(errorHandler(400, 'Student ID is required'));
        }

        // Get count of enrolled courses for the student
        const [result] = await pool.query(
            'SELECT COUNT(*) as course_count FROM course_enrollment WHERE stu_id = ?', 
            [student_id]
        );
        
        const courseCount = result[0].course_count;
        
        res.json({ 
            success: true,
            student_id: student_id,
            enrolled_course_count: courseCount,
            message: `Student has enrolled in ${courseCount} course(s)`
        });
        
    } catch (error) {
        next(error);
    }
}


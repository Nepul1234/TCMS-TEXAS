import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const adminProfileData = async (req, res, next) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(errorHandler(404, "Admin not found"));
        }
        const admin = rows[0];
        if (admin.profile_picture) {
            admin.profile_picture = Buffer.from(admin.profile_picture).toString('base64');
        }
        res.status(200).json({ data:admin });


    } catch (error) {
        next(error);
    }
}
export const studentProfileData = async (req, res, next) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM student WHERE stu_id = ?', [id]);
        if (rows.length === 0) {
            return next(errorHandler(404, "Student not found"));
        }
        res.status(200).json({ data:rows });
    } catch (error) {
        next(error);
    }
}
export const teacherProfileData = async (req, res, next) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM teacher WHERE teacher_id = ?', [id]);
        if (rows.length === 0) {
            return next(errorHandler(404, "Teacher not found"));
        }
        res.status(200).json({ data: rows });
    } catch (error) {
        next(error);
    }
}
export const getAllTeacherData = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teacher');
        if (rows.length === 0) {
            return next(errorHandler(404, "No teachers found"));
        }
        res.status(200).json({ data: rows });
    } catch (error) {
        next(error);
    }
}

export const getSuperAdminProfileData = async (req, res, next) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM superadmin WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(errorHandler(404, "Super Admin not found"));
        }
        const admin = rows[0];
        if (admin.profile_picture) {
            admin.profile_picture = Buffer.from(admin.profile_picture).toString('base64');
        }
        res.status(200).json({ data:admin });
    } catch (error) {
        next(error);
    }
}
import pool from "../utils/dbconn.js";
import errorHandler from "../utils/error.js";

export const adminProfileUpdate = async (req, res, next) => {
    const { id, fname, lname, email, phone, address,country,postal_code, } = req.body;
    try {
        const [rows] = await pool.query('UPDATE admin SET Fname = ?, Lname = ?, Email = ?, Tel_no = ?, Address = ?,country = ?,postal_code = ? WHERE id = ?', [fname, lname, email, phone,address,country,postal_code, id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Admin not found"));
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        next(error);
    }
}

export const superAdminProfileUpdate = async (req, res, next) => {
    const { id, fname, lname, email, phone, address,country,postal_code } = req.body;
    try {
        const [rows] = await pool.query('UPDATE superadmin SET Fname = ?, Lname = ?, Email = ?, Tel_no = ?, Address = ? WHERE id = ?', [fname, lname, email, phone,address, id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Super Admin not found"));
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {   
        next(error);
    }
}

export const studentProfileUpdate = async (req, res, next) => {
    const { id, fname, lname, email, phone } = req.body;
    try {
        const [rows] = await pool.query('UPDATE student SET Fname = ?, Lname = ?, Email = ?, Tel_no = ? WHERE stu_id = ?', [fname, lname, email, phone, id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Student not found"));
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        next(error);
    }
}
export const teacherProfileUpdate = async (req, res, next) => {
    const { id, fname, lname, email, phone } = req.body;
    try {
        const [rows] = await pool.query('UPDATE teacher SET fname = ?, lname = ?, email = ?, tel_no = ? WHERE teacher_id = ?', [fname, lname, email, phone, id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Teacher not found"));
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        next(error);
    }
}

export const adminProfilePhotoUpdate = async (req, res, next) => {
    const { id } = req.body;
    try {
        if (!req.file) {
            return next(errorHandler(400, "No file uploaded"));
        }
        const profilePicture = req.file.buffer;
        const [rows] = await pool.query('UPDATE admin SET profile_picture = ? WHERE id = ?', [profilePicture, id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Admin not found"));
        }
        res.status(200).json({ message: "Profile picture updated successfully" });
    } catch (error) {
        next(error);
    }
}

export const superAdminProfilePhotoUpdate = async (req, res, next) => {
    const { id } = req.body;
    if (!req.file) {
            return next(errorHandler(400, "No file uploaded"));
        }
    const profilePicture = req.file.buffer;
    try {
        const [rows] = await pool.query('UPDATE superadmin SET  profile_picture = ? WHERE id = ?', [profilePicture,id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, "Super Admin not found"));
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        next(error);
    }
}

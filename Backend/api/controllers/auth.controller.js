import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {transporter} from '../config/mailer.js';
const JWT_SECRET = 'Testing';



export const signin = async (req, res, next) => {
    const { id, email, password } = req.body;
    try{
        let rows = null;
        let role = null;
        let uid = null;
        const [student] = await pool.query('SELECT * FROM student WHERE stu_id = ? AND Password = ?', [id, password]);
        if(student.length > 0){
            uid = student ? student[0].stu_id : null;
            rows = student;
            role = 'student';
        }
        const [admin] = await pool.query('SELECT * FROM admin WHERE Email = ? AND password = ?',[id,password]);
         if(admin.length > 0){
             uid = admin ? admin[0].id : null;
             rows = admin;
             role = 'admin';
         }
         const [tutor] = await pool.query('SELECT * FROM teacher WHERE teacher_id = ? AND password = ?',[id,password]);
         if(tutor.length > 0){
            uid = tutor ? tutor[0].teacher_id : null;
            rows = tutor;
            role = 'teacher';
         }
        
        const [superadmin] = await pool.query('SELECT * FROM superadmin WHERE Email = ? AND password = ?',[id,password]);
        if(superadmin.length > 0){
            uid = superadmin ? superadmin[0].id : null;
            rows = superadmin;
            role = 'super_admin';
        }
        if(!rows){
            return next(errorHandler(404, "User not found"));
        }
        else {
            const token = jwt.sign({ id: uid, username: rows[0].Fname + rows[0].Lname,role:role}, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        }
        

    }catch(error){
        next(error);
    }
}

export const resetPassword = async (req, res, next) => {
    const { email } = req.body;
    try{
        const [rows] = await pool.query('SELECT * FROM admin WHERE Email = ?', [email]);
        if(rows.length === 0){
            return next(errorHandler(404, "User not found"));
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiration = new Date(Date.now() + 10 * 60000); // 10 minutes

        // Store OTP and expiration in the database
        await pool.query('INSERT INTO temporary_verifications (email, resetPasswordOtp, resetPasswordExpires) VALUES (?, ?, ?)', [email, otp, expiration]);

        // Send OTP to user's email
        await transporter.sendMail({
           to: email,
           subject: 'Password Reset OTP',
           text: `Your OTP code is ${otp} (expires in 10 minutes)`
        });
        const message = "OTP sent to your email";
        res.status(200).json({message: message });
    }catch(error){
        next(error);
    }
}

export const verifyOtp = async (req, res, next) => {
    const { email, otpValue } = req.body;
    try{
        const [rows] = await pool.query('SELECT * FROM temporary_verifications WHERE email = ? AND resetPasswordOtp = ?', [email, otpValue]);
        if(rows.length === 0){
            return next(errorHandler(404, "Invalid or expired OTP"));
        }
        res.status(200).json({ message: "OTP verified successfully" });
    }catch(error){
        next(error);
    }
}
export const updatePassword = async (req, res, next) => {
    const { email, newPassword } = req.body;
    try{
        

        const [rows] = await pool.query('UPDATE admin SET password = ? WHERE Email = ?', [newPassword, email]);
        if(rows.affectedRows === 0){
            return next(errorHandler(404, "Password update failed"));
        }
        res.status(200).json({ message: "Password updated successfully" });
    }catch(error){
        next(error);
    }
}

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(errorHandler(401, 'Unauthorized token'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expired' });
            }
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};


// Main authentication middleware
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(errorHandler(401, 'Access Denied'));
    }

    try {
        const verified = jwt.verify(token, "Testing");
        req.user = verified; // This sets: { id, name, role, email }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(errorHandler(403, 'Token expired'));
        }
        return next(errorHandler(403, 'Invalid token'));
    }
};

// Role checking middleware - FIXED
export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // Check if req.user exists (should be set by authMiddleware)
        if (!req.user) {
            return next(errorHandler(401, 'Authentication required'));
        }

        // Check if user has the required role
        if (req.user.role !== requiredRole) {
            return next(errorHandler(403, `Access denied. ${requiredRole} role required.`));
        }
        next();
    };
};

// Convenience middleware for teacher routes
export const requireTeacher = (req, res, next) => {
    if (!req.user) {
        return next(errorHandler(401, 'Authentication required'));
    }

    if (req.user.role !== 'teacher') {
        return next(errorHandler(403, 'Teacher access required'));
    }

    next();
};

// Convenience middleware for student routes
export const requireStudent = (req, res, next) => {
    if (!req.user) {
        return next(errorHandler(401, 'Authentication required'));
    }

    if (req.user.role !== 'student') {
        return next(errorHandler(403, 'Student access required'));
    }

    next();
};






import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getAllUserData = async (req, res, next) => {
    try {
        const [allStudents] = await pool.query('SELECT * FROM student');
        const [allTeachers] = await pool.query('SELECT * FROM teacher');
        if (allStudents.length === 0 && allTeachers.length === 0) {
            return next(errorHandler(404, 'No user data found'));
        }
        const students = allStudents.map(row => ({
            role: 'student',
            id: row.stu_id,
            name: `${row.Fname} ${row.Lname}`,
            email: row.Email,
            phone: row.Tel_no,
            address: row.Address,
            gender:row.Gender,
            joinDate: row.Enroll_date,
            grade:row.Grade,
            parent_tel_no: row.Parent_tel,
            dob: row.Dob,
            nic: row.NIC,
            school: row.School,
            country: row.country,
            city:row.City,
            province: row.Province,
            status:'Active',
            profile_picture: row.p_picture 
        }))
        const teachers = allTeachers.map(row => ({
            role: 'teacher',
            name: `${row.Fname} ${row.Lname}`,
            id: row.teacher_id,
            email: row.email,
            phone: row.tel_no,
            address: row.address,
            gender:row.Gender,
            dob: row.Dob,
            nic: row.NIC,
            qualification: row.qualification,
            joinDate: row.enroll_date,
            status:'Active',
            profile_picture: row.profile_pic ? Buffer.from(row.profile_pic).toString('base64') : null
        }));
        const details = [...students, ...teachers];

        
    
        
        res.status(200).json({
            details
        });
    } catch (error) {
        next(error);
    }
}

export const deactivateUser = async (req, res, next) => {
    const { userId } = req.body;
    try {
        const [rows] = await pool.query('INSERT INTO deactivated_users (user_id, deactivated_at) VALUES (?, NOW())', [userId]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, 'No user found with this ID'));
        }
        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        next(error);
    }
}

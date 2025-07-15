import pool from "../utils/dbconn.js";
import errorHandler from "../utils/error.js";;

export const registerNewUser = async (req, res, next) => {
    const { fname, lname, email, address, gender, mobileno } = req.body;

    try {
        const mn = parseInt(mobileno, 10);

        // Check if the email already exists
        const [existingEmail] = await pool.query('SELECT * FROM student WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return next(errorHandler(400, 'Email already in use'));
        }

        // Check if the student with the same name already exists (optional, or can be removed)
        const [existingUser] = await pool.query('SELECT * FROM student WHERE fname = ? AND Lname = ?', [fname, lname]);
        if (existingUser.length > 0) {
            return next(errorHandler(400, 'User already exists'));
        }

        // Insert the new user into the database
        await pool.query('INSERT INTO student (fname, Lname, Email, Address, Gender, Enroll_date, Tel_no) VALUES (?, ?, ?, ?, ?, NOW(), ?)', 
            [fname, lname, email, address, gender, mn]);

        // Retrieve the student ID and Enroll date based on email
        const [student_dat] = await pool.query('SELECT stu_id, Enroll_date FROM student WHERE email = ?', [email]);
        const studentId = student_dat[0]?.stu_id;
        const enrolledon = student_dat[0]?.Enroll_date;

        if (!studentId) {
            return next(errorHandler(500, 'Failed to retrieve student ID'));
        }
        if (!enrolledon) {
            return next(errorHandler(500, 'Failed to retrieve Enroll_date'));
        }

        res.json({ message: 'User registered successfully', fname, lname, studentId, Enroll_date: enrolledon });
    } catch (error) {
        next(error);
    }
};


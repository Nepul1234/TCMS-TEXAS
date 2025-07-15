import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import bcrypt from "bcryptjs";


export const registerNewStudent = async (req, res, next) => {
    const { fname, lname, email, address, gender, mobileno, password, nic, dob, grade, school, parent_mn, city, state, country } = req.body;
    const profilePictureBuffer = req.file?.buffer || null; // Get the buffer from the uploaded file
  
    console.log(req.body);
    try {
        const mn = parseInt(mobileno, 10);
        const pmn = parseInt(parent_mn, 10);
        const hashedPassword = await bcrypt.hash(password, 10); 

    
        const [existingUser] = await pool.query('SELECT * FROM student WHERE Fname = ? AND Lname = ? AND Address = ?', [fname, lname, address]);
        if (existingUser.length > 0) {
            return next(errorHandler(400, 'User already exists'));
        }

        await pool.query("INSERT INTO student (Fname, Lname, Email, Address, Gender, Enroll_date, Tel_no,Password,profile_picture, Dob, Grade, School, Parent_tel, nic, city, Province, Country) VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Asia/Kolkata'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [fname, lname, email, address, gender, mn, hashedPassword, profilePictureBuffer, dob, grade, school, pmn, nic, city, state, country]);

        const [student_dat] = await pool.query('SELECT stu_id, Enroll_date FROM student WHERE Fname = ? AND Lname = ? AND Address = ?', [fname, lname, address]);
        const studentId = student_dat[0]?.stu_id;
        const enrolledon = student_dat[0]?.Enroll_date;

        if (!studentId) {
            return next(errorHandler(500, 'Failed to retrieve student ID'));
        }
        if (!enrolledon) {
            return next(errorHandler(500, 'Failed to retrieve Enroll_date'));
        }

        res.json({ message: 'User registered successfully', fname, lname, studentId, Enroll_date: enrolledon, grade });
    } catch (error) {
        next(error);
    }
};

export const registerNewTeacher = async (req,res,next) => {
    const { fname, lname, email, address, qualification, country, state, mobileno, gender, password, dob, nic } = req.body;
    const profilePictureBuffer = req.file?.buffer || null;

    try {
        const mn = parseInt(mobileno, 10);
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const nic_formatted = nic.replace(/[-\s]/g, ''); // Remove dashes and spaces from NIC

        // Check if the email already exists
        const [existingEmail] = await pool.query('SELECT * FROM teacher WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return next(errorHandler(400, 'Email already in use'));
        }

        await pool.query("INSERT INTO teacher (fname, lname,address, email, qualification, tel_no, password, enroll_date, Dob, Gender, NIC, profile_picture) VALUES (?, ?, ?,?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)", 
            [fname, lname, address, email, qualification, mn, hashedPassword,dob, gender, nic_formatted, profilePictureBuffer]);

        // student ID and Enroll date 
        const [teacherData] = await pool.query('SELECT teacher_id,enroll_date FROM teacher WHERE fname = ? AND lname = ?', [fname,lname]);
        const teacherId = teacherData[0]?.teacher_id;
        const enrolledon = teacherData[0]?.enroll_date;

        if (!teacherId) {
            return next(errorHandler(500, 'Failed to retrieve teacher ID'));
        }

        res.json({ message: 'User registered successfully',fname,lname,email,address,teacherId,enrolledon });
    } catch (error) {
        next(error);
    }
};

export const registerNewCourse = async (req,res,next) => {
    const {cname,ctype,grade,tname,starting_t,ending_t,Fees,weekday,hall_alloc} = req.body;
    try {
        const gde = parseInt(grade, 10);
        const fees = parseInt(Fees);
        const [teacher_id] = await pool.query('SELECT teacher_id FROM teacher WHERE fname = ? AND lname = ?', [tname.split(' ')[0],tname.split(' ')[1]]);
        const teacherId = teacher_id[0]?.teacher_id;
        const [existingCourse] = await pool.query('SELECT * FROM course WHERE course_name = ? AND t_id = ?', [cname, teacherId]);
        if (existingCourse.length > 0) {
            return next(errorHandler(400, 'Course already exists'));
        }

        //make sure the hall allocation is previouly not scheduled as the same
        const [existingAllocation] = await pool.query("SELECT * FROM course WHERE start_time = ? AND end_time = ? AND hall_allocation = ? AND weekday = ?",[starting_t,ending_t,hall_alloc,weekday]);
        if(existingAllocation.length > 0){
            return next(errorHandler(400, "Hall allocation failed"))
        }

        // Inserting the new course into the database
        await pool.query('INSERT INTO course (course_name,grade,start_time,end_time,t_id,course_type,Fees,weekday,hall_allocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [cname, gde, starting_t, ending_t, teacherId, ctype, fees, weekday, hall_alloc]);
        res.json({ message: 'Course registered successfully', courseName: cname });
    } catch (error) {
        next(error);
    }
}

export const registerNewAdmin = async (req, res, next) => {
const {
  fname,
  lname,
  email,
  gender,
  address,
  city,
  country,
  state,
  zipcode,
  mobileno,
  permenent_number,
  password,
  emp_no,
  dob,
  nic,
  nationality,
  martial_status,
  emp_type,
  emp_qualification,
  tax_id,
  epf_number,
  designation,
  salary
} = req.body;   
 const profilePictureBuffer = req.file?.buffer || null; // Get the buffer from the uploaded file

    try {
        const mn = parseInt(mobileno, 10);
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const nic_formatted = nic.replace(/[-\s]/g, '');

        // Check if the email already exists
        const [existingEmail] = await pool.query('SELECT * FROM employee WHERE Email = ?', [email]);
        if (existingEmail.length > 0) {
            return next(errorHandler(400, 'Email already in use'));
        }
        

        await pool.query("INSERT INTO employee (Fname, Lname, Email, Address, City, State, Gender, Dob, NIC,  Mobile_number, Permenant_mobile, password, Marital_status, Designation, Emp_no, Tax_id, Salary,Epf, profile_picture, Nationality, Emp_type, Qualifications, Enroll_date) VALUES (?, ?, ?, ?, ?, ?, ? , ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?, CURDATE())", 
            [fname, lname, email, address, city,state,gender, dob, nic_formatted, mn, permenent_number, hashedPassword, martial_status, designation, emp_no, tax_id, salary, epf_number, profilePictureBuffer,nationality, emp_type, emp_qualification]);

        res.json({ message: 'Employee registered successfully', fname, lname,email });
    } catch (error) {
        next(error);
    }
}
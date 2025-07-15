import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getCourseEnrollment = async (req, res, next) => {
    const { student_id } = req.body;
    try {
        const [enrollment] = await pool.query('SELECT * FROM course_enrollment WHERE stu_id = ?', [student_id]);
        if (enrollment.length === 0) {
            return next(errorHandler(404, 'No course enrollment found for this student'));
        }
        const courseDetails = [];
        for(const enroll of enrollment) {
            const [course] = await pool.query("SELECT c.course_id AS course_id ,c.grade AS grade,c.Fees AS fees,c.course_type AS course_type,CONCAT(t.fname,' ', t.lname) AS teacher_name, c.weekday AS weekday FROM course c JOIN teacher t ON c.t_id = t.teacher_id WHERE c.course_id = ?", [enroll.course_id]);
            if (course.length === 0) {
            return next(errorHandler(404, `No course details found for course_id: ${enroll.course_id}`));
            }
            courseDetails.push(course[0]);
        }
        res.json({ courseDetails });
    } catch (error) {
        next(error);
    }
};

export const getCourseEnrollmentRequests = async (req, res, next) => {
    try {
        const [requests] = await pool.query('SELECT s.stu_id,cer.id, s.Fname, s.Lname, s.Email, c.grade, s.profile_picture,cer.status,cer.request_date, c.course_id, c.course_name, c.course_type FROM course_enrollment_requests cer JOIN student s ON cer.student_id = s.stu_id JOIN course c ON cer.course_id = c.course_id');
        if (requests.length === 0) {
            return next(errorHandler(404, 'No course enrollment requests found'));
        }
        res.status(200).json({ requests });
    } catch (error) {
        next(error);
    }
};
export const approveCourseEnrollmentRequest = async (req, res, next) => {
    const { requestId , status } = req.body;
    try {
        const [request] = await pool.query('SELECT * FROM course_enrollment_requests WHERE id = ?', [requestId]);
        if (request.length === 0) {
            return next(errorHandler(404, 'No course enrollment request found'));
        }
        const [enrollment] = await pool.query('INSERT INTO course_enrollment (stu_id, course_id) VALUES (?, ?)', [request[0].student_id, request[0].course_id]);
        if (enrollment.affectedRows === 0) {
            return next(errorHandler(500, 'Failed to approve course enrollment request'));
        }
        if(status === 'Approved') {
            await pool.query('UPDATE course_enrollment_requests SET status = ? WHERE id = ?', [status, requestId]);
        }
        await pool.query('UPDATE course_enrollment_requests SET status = ? WHERE id = ?', [status, requestId]);

        res.status(200).json({ message: 'Course enrollment request approved successfully' });
    } catch (error) {
        next(error);
    }
}

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

export const getAllCoursesWithStudentsAndTeachers = async (req, res, next) => {
    try {
        const [courses] = await pool.query(`
            SELECT 
  c.course_id,
  c.course_name,
  c.description,
  c.grade,
  c.start_time,
  c.end_time,
  c.weekday,
  c.course_type,
  c.Fees,
  c.hall_allocation,
  t.teacher_id,
  t.fname AS teacher_fname,
  t.lname AS teacher_lname,
  t.email AS teacher_email,
  s.stu_id,
  s.Fname AS student_fname,
  s.Lname AS student_lname,
  s.Email AS student_email,
  ce.e_id,
  s.Enroll_date
FROM course c
LEFT JOIN teacher t ON c.t_id = t.teacher_id
LEFT JOIN course_enrollment ce ON c.course_id = ce.course_id
LEFT JOIN student s ON ce.stu_id = s.stu_id;
        `);
      const coursesMap = {};

      for (const row of courses) {
        const courseId = row.course_id;

      if (!coursesMap[courseId]) {
        coursesMap[courseId] = {
          id: courseId,
          title: row.course_name,
          description: row.description,
          level: row.grade,
          duration: "Monthly Paid",
          price: row.Fees,
          instructor: `${row.teacher_fname} ${row.teacher_lname}`,
          instructorId: row.teacher_id,
          schedule: `${row.weekday} - ${row.start_time}`,
          location: row.hall_allocation || "TBD",
          enrolledStudents: 0,
          maximumStudents: 30,
          weekday: row.weekday,
          maxStudents:"100",
          startDate: "N/A", 
          endDate: "N/A",
          status: "active",
          type: row.course_type,
          grade:row.grade,
          image: "",
          students: [],
          teachers: [
            {
              id: row.teacher_id,
              name: `${row.name} ${row.teacher_lname}`,
              role: "Teacher",
              email: row.teacher_email,
            }
          ]
        };
      }

      if (row.stu_id) {
        coursesMap[courseId].students.push({
          id: row.stu_id,
          name: `${row.student_fname} ${row.student_lname}`,
          email: row.student_email,
          enrolledDate: row.Enroll_date,
        });
        coursesMap[courseId].enrolledStudents++;
      }
    }

    const finalCourses = Object.values(coursesMap);

    res.status(200).json(finalCourses);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

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



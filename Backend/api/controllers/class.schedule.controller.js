import errorHandler from "../utils/error.js";
import pool from '../utils/dbconn.js';

export const getStudentSchedules = async (req, res, next) => {
  try {

    const { studentId } = req.params;
    
    console.log('Student ID from query:', studentId); // Debug log
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const query = `
      SELECT 
        cs.id,
        cs.course_id,
        cs.teacher_id,
        cs.day,
        cs.start_time,
        cs.end_time,
        cs.type,
        cs.color,
        cs.mode,
        c.course_id as course_code,  -- Added alias for course_code
        c.course_name,
        CONCAT(t.fname, ' ', t.lname) as instructor,
        t.fname,
        t.lname
      FROM classschedules cs
      INNER JOIN course_enrollment ce ON cs.course_id = ce.course_id
      INNER JOIN course c ON cs.course_id = c.course_id
      INNER JOIN teacher t ON cs.teacher_id = t.teacher_id
      WHERE ce.stu_id = ?
      ORDER BY 
        FIELD(cs.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        cs.start_time ASC
    `;

    console.log('Executing query with student ID:', studentId); // Debug log
    
    const [schedules] = await pool.query(query, [studentId]);
    
    console.log('Query results:', schedules); // Debug log

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No schedules found for this student'
      });
    }

    // Format the response to match your frontend structure
    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      courseCode: schedule.course_code,
      courseName: schedule.course_name,
      instructor: schedule.instructor,
      day: schedule.day,
      startTime: formatTime(schedule.start_time),
      endTime: formatTime(schedule.end_time),
      type: schedule.type,
      color: schedule.color,
      mode: schedule.mode
    }));

    res.status(200).json({
      success: true,
      message: 'Student schedules retrieved successfully',
      data: formattedSchedules,
      count: formattedSchedules.length
    });

  } catch (error) {
    console.error('Error fetching student schedules:', error);
    next(errorHandler(500, 'Internal server error while fetching schedules'));
  }
};


// Additional method to get schedule summary/analytics
export const getStudentScheduleSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT cs.course_id) as enrolled_courses,
        COUNT(CASE WHEN cs.mode = 'Online' THEN 1 END) as online_sessions,
        COUNT(CASE WHEN cs.mode = 'Physical' THEN 1 END) as physical_sessions,
        SUM(
          TIME_TO_SEC(TIMEDIFF(cs.end_time, cs.start_time)) / 3600
        ) as total_weekly_hours
      FROM classschedules cs
      INNER JOIN course_enrollment ce ON cs.course_id = ce.course_id
      WHERE ce.stu_id = ?
    `;

    const summary = await executeQuery(summaryQuery, [studentId]);

    res.status(200).json({
      success: true,
      message: 'Schedule summary retrieved successfully',
      data: {
        enrolledCourses: summary[0].enrolled_courses || 0,
        onlineSessions: summary[0].online_sessions || 0,
        physicalSessions: summary[0].physical_sessions || 0,
        totalWeeklyHours: parseFloat(summary[0].total_weekly_hours || 0).toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error fetching schedule summary:', error);
    next(errorHandler(500, 'Internal server error while fetching schedule summary'));
  }
};

// Function to execute database queries (Promise-based)
export const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Function to format time from 24-hour to 12-hour format
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
};
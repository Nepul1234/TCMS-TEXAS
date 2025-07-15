// controllers/studentResultsController.js
import pool from "../utils/dbconn.js";

export const getStudentResults = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    const query = `
      SELECT 
        r.*,
        c.course_name,
        c.course_id,
        c.grade,
        CONCAT(s.Fname, ' ', s.Lname) as student_name
      FROM student_marks r
      JOIN course c ON r.course_id = c.course_id
      JOIN student s ON r.stu_id = s.stu_id
      WHERE r.stu_id = ?
      ORDER BY r.mark_id
    `;

    const queryResult = await pool.query(query, [student_id]);
    
    // Extract the actual rows from the result (first element of the array)
    const results = queryResult[0];


    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No results found for this student",
        results: []
      });
    }

    // Transform the data to match your UI format
    const transformedResults = results.map(result => {

      
      const assessments = [];
      
      // Add test results if they exist
      if (result.first_test_marks !== null && result.first_test_marks !== undefined) {
        assessments.push({
          id: `${result.stu_id}_${result.course_id}_first_test`,
          course: result.course_name,
          course_id: result.course_id,
          title: 'First Test',
          type: 'exam',
          score: result.first_test_marks,
          maxScore: 100,
          percentage: result.first_test_marks,
          status: 'completed',
          submittedAt: result.created_at || new Date().toISOString(),
          feedback: result.feedback || null,
          attempts: 1,
          timeSpent: 'N/A',
          grade: result.grade
        });
      }

      if (result.second_test_marks !== null && result.second_test_marks !== undefined) {
        assessments.push({
          id: `${result.stu_id}_${result.course_id}_second_test`,
          course: result.course_name,
          course_id: result.course_id,
          title: 'Second Test',
          type: 'exam',
          score: result.second_test_marks,
          maxScore: 100,
          percentage: result.second_test_marks,
          status: 'completed',
          submittedAt: result.created_at || new Date().toISOString(),
          feedback: result.feedback || null,
          attempts: 1,
          timeSpent: 'N/A',
          grade: result.grade
        });
      }

      if (result.third_test_marks !== null && result.third_test_marks !== undefined) {
        assessments.push({
          id: `${result.stu_id}_${result.course_id}_third_test`,
          course: result.course_name,
          course_id: result.course_id,
          title: 'Third Test',
          type: 'exam',
          score: result.third_test_marks,
          maxScore: 100,
          percentage: result.third_test_marks,
          status: 'completed',
          submittedAt: result.created_at || new Date().toISOString(),
          feedback: result.feedback || null,
          attempts: 1,
          timeSpent: 'N/A',
          grade: result.grade
        });
      }

      if (result.assignment_marks !== null && result.assignment_marks !== undefined) {
        assessments.push({
          id: `${result.stu_id}_${result.course_id}_assignment`,
          course: result.course_name,
          course_id: result.course_id,
          title: 'Assignment',
          type: 'assignment',
          score: result.assignment_marks,
          maxScore: 100,
          percentage: result.assignment_marks,
          status: 'completed',
          submittedAt: result.created_at || new Date().toISOString(),
          feedback: result.feedback || null,
          attempts: 1,
          timeSpent: 'N/A',
          grade: result.grade
        });
      }

      if (result.quiz_marks !== null && result.quiz_marks !== undefined) {
        assessments.push({
          id: `${result.stu_id}_${result.course_id}_quiz`,
          course: result.course_name,
          course_id: result.course_id,
          title: 'Quiz',
          type: 'quiz',
          score: result.quiz_marks,
          maxScore: 100,
          percentage: result.quiz_marks,
          status: 'completed',
          submittedAt: result.created_at || new Date().toISOString(),
          feedback: result.feedback || null,
          attempts: 1,
          timeSpent: 'N/A',
          grade: result.grade
        });
      }

      return assessments;
    }).flat();

    res.status(200).json({
      success: true,
      message: "Student results retrieved successfully",
      results: transformedResults,
      student_name: results[0]?.student_name,
      total_results: transformedResults.length
    });

  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get results by course for the logged-in student
export const getStudentResultsByCourse = async (req, res) => {
  try {
    const { student_id, course_id } = req.params;
    
    if (!student_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Course ID are required"
      });
    }

    const query = `
      SELECT 
        r.*,
        c.course_name,
        c.course_id,
        c.grade,
        CONCAT(s.Fname, ' ', s.Lname) as student_name
      FROM student_marks r
      JOIN course c ON r.course_id = c.course_id
      JOIN student s ON r.stu_id = s.stu_id
      WHERE r.stu_id = ? AND r.course_id = ?
      ORDER BY r.mark_id DESC
    `;

    const queryResult = await db.query(query, [student_id, course_id]);
    
    // Extract the actual rows from the result (first element of the array)
    const results = queryResult[0];

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No results found for this student in this course",
        results: []
      });
    }

    const result = results[0];
    const assessments = [];
    
    // Transform data for specific course
    if (result.first_test_marks !== null && result.first_test_marks !== undefined) {
      assessments.push({
        id: `${result.stu_id}_${result.course_id}_first_test`,
        course: result.course_name,
        course_id: result.course_id,
        title: 'First Test',
        type: 'exam',
        score: result.first_test_marks,
        maxScore: 100,
        percentage: result.first_test_marks,
        status: 'completed',
        submittedAt: result.created_at || new Date().toISOString(),
        feedback: result.feedback || null,
        attempts: 1,
        timeSpent: 'N/A',
        grade: result.grade
      });
    }

    if (result.second_test_marks !== null && result.second_test_marks !== undefined) {
      assessments.push({
        id: `${result.stu_id}_${result.course_id}_second_test`,
        course: result.course_name,
        course_id: result.course_id,
        title: 'Second Test',
        type: 'exam',
        score: result.second_test_marks,
        maxScore: 100,
        percentage: result.second_test_marks,
        status: 'completed',
        submittedAt: result.created_at || new Date().toISOString(),
        feedback: result.feedback || null,
        attempts: 1,
        timeSpent: 'N/A',
        grade: result.grade
      });
    }

    if (result.third_test_marks !== null && result.third_test_marks !== undefined) {
      assessments.push({
        id: `${result.stu_id}_${result.course_id}_third_test`,
        course: result.course_name,
        course_id: result.course_id,
        title: 'Third Test',
        type: 'exam',
        score: result.third_test_marks,
        maxScore: 100,
        percentage: result.third_test_marks,
        status: 'completed',
        submittedAt: result.created_at || new Date().toISOString(),
        feedback: result.feedback || null,
        attempts: 1,
        timeSpent: 'N/A',
        grade: result.grade
      });
    }

    if (result.assignment_marks !== null && result.assignment_marks !== undefined) {
      assessments.push({
        id: `${result.stu_id}_${result.course_id}_assignment`,
        course: result.course_name,
        course_id: result.course_id,
        title: 'Assignment',
        type: 'assignment',
        score: result.assignment_marks,
        maxScore: 100,
        percentage: result.assignment_marks,
        status: 'completed',
        submittedAt: result.created_at || new Date().toISOString(),
        feedback: result.feedback || null,
        attempts: 1,
        timeSpent: 'N/A',
        grade: result.grade
      });
    }

    if (result.quiz_marks !== null && result.quiz_marks !== undefined) {
      assessments.push({
        id: `${result.stu_id}_${result.course_id}_quiz`,
        course: result.course_name,
        course_id: result.course_id,
        title: 'Quiz',
        type: 'quiz',
        score: result.quiz_marks,
        maxScore: 100,
        percentage: result.quiz_marks,
        status: 'completed',
        submittedAt: result.created_at || new Date().toISOString(),
        feedback: result.feedback || null,
        attempts: 1,
        timeSpent: 'N/A',
        grade: result.grade
      });
    }

    res.status(200).json({
      success: true,
      message: "Course results retrieved successfully",
      results: assessments,
      student_name: result.student_name,
      course_name: result.course_name
    });

  } catch (error) {
    console.error("Error fetching course results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
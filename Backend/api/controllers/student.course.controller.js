// controllers/studentCourseController.js - Fixed Version
import pool from "../utils/dbconn.js";
import { containerClient, getBlobUrl, generateBlobName } from '../config/azureStorage.js';

// Get course materials for enrolled students
export const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // First verify student is enrolled in the course
    const [enrollmentCheck] = await pool.execute(
      'SELECT * FROM course_enrollment WHERE stu_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get published course materials (excluding assignments)
    const [materials] = await pool.execute(`
      SELECT 
        cm.id,
        cm.title,
        cm.content,
        cm.material_type,
        cm.file_attachments,
        cm.publish_date,
        cm.created_at,
        c.course_name,
        t.fname
      FROM course_materials cm
      JOIN course c ON cm.course_id = c.course_id
      JOIN teacher t ON cm.teacher_id = t.teacher_id
      WHERE cm.course_id = ? 
        AND cm.is_published = TRUE 
        AND cm.material_type != 'assignment'
      ORDER BY cm.order_index ASC, cm.created_at DESC
    `, [courseId]);

    // Parse file attachments JSON and add download URLs
    const formattedMaterials = materials.map(material => ({
      ...material,
      file_attachments: material.file_attachments ? JSON.parse(material.file_attachments) : []
    }));

    res.json({
      success: true,
      data: formattedMaterials,
      message: 'Course materials retrieved successfully'
    });

  } catch (error) {
    console.error('Get course materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course materials',
      error: error.message
    });
  }
};

// Download course material file from Azure Blob Storage
export const downloadMaterialFile = async (req, res) => {
  try {
    const { materialId, fileIndex } = req.params;
    const studentId = req.user.id;

    // Get material and verify student access
    const [materialResult] = await pool.execute(`
      SELECT cm.*, ce.stu_id 
      FROM course_materials cm
      JOIN course_enrollment ce ON cm.course_id = ce.course_id
      WHERE cm.id = ? AND ce.stu_id = ? AND cm.is_published = TRUE AND cm.material_type != 'assignment'
    `, [materialId, studentId]);

    if (materialResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or access denied'
      });
    }

    const material = materialResult[0];
    const fileAttachments = material.file_attachments ? JSON.parse(material.file_attachments) : [];
    
    if (!fileAttachments[fileIndex]) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = fileAttachments[fileIndex];
    const blobName = file.blobName || file.path; // Support both old and new formats

    try {
      // Get blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      // Check if blob exists
      const exists = await blockBlobClient.exists();
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'File not found in storage'
        });
      }

      // Get blob properties for metadata
      const properties = await blockBlobClient.getProperties();
      
      // Update view count
      await pool.execute(
        'UPDATE course_materials SET view_count = view_count + 1 WHERE id = ?',
        [materialId]
      );

      // Generate download URL or stream the file
      const downloadUrl = getBlobUrl(blobName);
      
      // Option 1: Redirect to Azure Blob URL (if blobs are publicly accessible)
      res.redirect(downloadUrl);
      
      // Option 2: Stream through your server (uncomment if you need server-side control)
      /*
      const downloadResponse = await blockBlobClient.download();
      
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
      res.setHeader('Content-Type', properties.contentType || 'application/octet-stream');
      res.setHeader('Content-Length', properties.contentLength);
      
      downloadResponse.readableStreamBody.pipe(res);
      */

    } catch (azureError) {
      console.error('Azure download error:', azureError);
      return res.status(500).json({
        success: false,
        message: 'Failed to download file from storage'
      });
    }

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};

// Get course assignments for enrolled students
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Verify student enrollment
    const [enrollmentCheck] = await pool.execute(
      'SELECT * FROM course_enrollment WHERE stu_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get published assignments with submission status
    const [assignments] = await pool.execute(`
      SELECT 
        cm.id,
        cm.title,
        cm.content,
        cm.created_at,
        a.id as assignment_id,
        a.due_date,
        a.max_points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.max_files,
        a.instructions,
        a.allow_late_submission,
        a.late_penalty_percent,
        c.course_name,
        t.fname,
        asub.id as submission_id,
        asub.submitted_at,
        asub.is_late,
        asub.grade,
        asub.status as submission_status,
        asub.feedback
      FROM course_materials cm
      JOIN assignments a ON cm.id = a.course_material_id
      JOIN course c ON cm.course_id = c.course_id
      JOIN teacher t ON cm.teacher_id = t.teacher_id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE cm.course_id = ?
        AND cm.is_published = TRUE
        AND cm.material_type = 'assignment'
      ORDER BY a.due_date ASC, cm.created_at DESC
    `, [studentId, courseId]);

    // Format the data
    const formattedAssignments = assignments.map(assignment => {
      // Parse allowed_file_types - handle JSON string from database
      let allowedFileTypes = [];
      
      if (assignment.allowed_file_types) {
        try {
          // Since your DB stores JSON arrays like ["pdf", "doc", "images"]
          // MySQL returns them as JSON strings, so we need to parse them
          if (typeof assignment.allowed_file_types === 'string') {
            allowedFileTypes = JSON.parse(assignment.allowed_file_types);
          } else if (Array.isArray(assignment.allowed_file_types)) {
            allowedFileTypes = assignment.allowed_file_types;
          } else {
            // Fallback - shouldn't happen with your data structure
            allowedFileTypes = [];
          }
          
          // Ensure it's an array
          if (!Array.isArray(allowedFileTypes)) {
            allowedFileTypes = [];
          }
        } catch (error) {
          console.error('Error parsing allowed_file_types:', error);
          console.error('Value was:', assignment.allowed_file_types);
          allowedFileTypes = [];
        }
      }

      return {
        id: assignment.id,
        assignment_id: assignment.assignment_id,
        title: assignment.title,
        content: assignment.content,
        instructions: assignment.instructions,
        due_date: assignment.due_date,
        max_points: assignment.max_points,
        allowed_file_types: allowedFileTypes,
        max_file_size_mb: assignment.max_file_size_mb,
        max_files: assignment.max_files,
        allow_late_submission: assignment.allow_late_submission,
        late_penalty_percent: assignment.late_penalty_percent,
        course_name: assignment.course_name,
        teacher_name: assignment.fname,
        created_at: assignment.created_at,
        // Submission info
        submitted: !!assignment.submission_id,
        submission: assignment.submission_id ? {
          id: assignment.submission_id,
          submitted_at: assignment.submitted_at,
          is_late: assignment.is_late,
          grade: assignment.grade,
          status: assignment.submission_status,
          feedback: assignment.feedback
        } : null
      };
    });

    res.json({
      success: true,
      data: formattedAssignments,
      message: 'Course assignments retrieved successfully'
    });

  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course assignments',
      error: error.message
    });
  }
};

// Get single assignment details for submission
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    // Get assignment details with course info
    const [assignmentResult] = await pool.execute(`
      SELECT 
        cm.id,
        cm.title,
        cm.content,
        cm.course_id,
        a.id as assignment_id,
        a.due_date,
        a.max_points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.max_files,
        a.instructions,
        a.allow_late_submission,
        a.late_penalty_percent,
        c.course_name,
        t.fname,
        ce.stu_id as enrolled_check
      FROM course_materials cm
      JOIN assignments a ON cm.id = a.course_material_id
      JOIN course c ON cm.course_id = c.course_id
      JOIN teacher t ON cm.teacher_id = t.teacher_id
      JOIN course_enrollment ce ON cm.course_id = ce.course_id
      WHERE a.id = ? AND ce.stu_id = ? AND cm.is_published = TRUE
    `, [assignmentId, studentId]);

    if (assignmentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    const assignment = assignmentResult[0];

    // Check if student has already submitted
    const [submissionCheck] = await pool.execute(
      'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    // Parse allowed_file_types safely
    let allowedFileTypes = [];
    
    if (assignment.allowed_file_types) {
      try {
        if (typeof assignment.allowed_file_types === 'string') {
          // Check if it's a JSON array string
          if (assignment.allowed_file_types.startsWith('[') && assignment.allowed_file_types.endsWith(']')) {
            allowedFileTypes = JSON.parse(assignment.allowed_file_types);
          } else {
            // Handle comma-separated string like "pdf,doc,images"
            allowedFileTypes = assignment.allowed_file_types
              .split(',')
              .map(type => type.trim())
              .filter(type => type.length > 0);
          }
        } else if (Array.isArray(assignment.allowed_file_types)) {
          allowedFileTypes = assignment.allowed_file_types;
        } else {
          // Convert to string and split
          allowedFileTypes = String(assignment.allowed_file_types)
            .split(',')
            .map(type => type.trim())
            .filter(type => type.length > 0);
        }
        
        // Ensure it's an array
        if (!Array.isArray(allowedFileTypes)) {
          allowedFileTypes = [];
        }
      } catch (error) {
        console.error('Error parsing allowed_file_types:', error);
        console.error('Value was:', assignment.allowed_file_types);
        allowedFileTypes = [];
      }
    }

    const formattedAssignment = {
      id: assignment.id,
      assignment_id: assignment.assignment_id,
      title: assignment.title,
      content: assignment.content,
      instructions: assignment.instructions,
      due_date: assignment.due_date,
      max_points: assignment.max_points,
      allowed_file_types: allowedFileTypes,
      max_file_size_mb: assignment.max_file_size_mb,
      max_files: assignment.max_files,
      allow_late_submission: assignment.allow_late_submission,
      late_penalty_percent: assignment.late_penalty_percent,
      course_name: assignment.course_name,
      teacher_name: assignment.fname, // Fixed: was assignment.teacher_name
      course_id: assignment.course_id,
      already_submitted: submissionCheck.length > 0,
      existing_submission: submissionCheck.length > 0 ? submissionCheck[0] : null
    };

    res.json({
      success: true,
      data: formattedAssignment,
      message: 'Assignment details retrieved successfully'
    });

  } catch (error) {
    console.error('Get assignment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignment details',
      error: error.message
    });
  }
};

// Submit assignment - Updated for Azure Blob Storage
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText } = req.body;
    const studentId = req.user.id;
    const files = req.files || [];

    // Validate assignment exists and student has access
    const [assignmentResult] = await pool.execute(`
      SELECT a.*, cm.course_id, ce.stu_id as enrolled_check
      FROM assignments a
      JOIN course_materials cm ON a.course_material_id = cm.id
      JOIN course_enrollment ce ON cm.course_id = ce.course_id
      WHERE a.id = ? AND ce.stu_id = ? AND cm.is_published = TRUE
    `, [assignmentId, studentId]);

    if (assignmentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    const assignment = assignmentResult[0];

    // Check if already submitted
    const [existingSubmission] = await pool.execute(
      'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    if (existingSubmission.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignment has already been submitted'
      });
    }

    // ✅ FIXED: Safe parsing of allowed_file_types
    let allowedFileTypes = [];
    
    if (assignment.allowed_file_types) {
      try {
        if (typeof assignment.allowed_file_types === 'string') {
          // Check if it's a JSON array string
          if (assignment.allowed_file_types.startsWith('[') && assignment.allowed_file_types.endsWith(']')) {
            allowedFileTypes = JSON.parse(assignment.allowed_file_types);
          } else {
            // Handle comma-separated string like "pdf,doc,images"
            allowedFileTypes = assignment.allowed_file_types
              .split(',')
              .map(type => type.trim())
              .filter(type => type.length > 0);
          }
        } else if (Array.isArray(assignment.allowed_file_types)) {
          allowedFileTypes = assignment.allowed_file_types;
        }
      } catch (error) {
        console.error('Error parsing allowed_file_types:', error);
        allowedFileTypes = [];
      }
    }

    const maxFiles = assignment.max_files || 0;
    const maxFileSize = (assignment.max_file_size_mb || 10) * 1024 * 1024; // Convert to bytes

    // Validate file count
    if (maxFiles > 0 && files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxFiles} files allowed`
      });
    }

    // Validate file types and sizes
    for (const file of files) {
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of ${assignment.max_file_size_mb}MB`
        });
      }

      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: `File type .${fileExtension} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`
        });
      }
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isLate = now > dueDate;

    if (isLate && !assignment.allow_late_submission) {
      return res.status(400).json({
        success: false,
        message: 'Late submissions are not allowed for this assignment'
      });
    }

    // ✅ ADDED: Validation for empty submission
    if (!submissionText?.trim() && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either written response or upload files'
      });
    }

    // Upload files to Azure Blob Storage
    let submittedFiles = [];
    
    if (files && files.length > 0) {
      try {
        const uploadPromises = files.map(async (file) => {
          const blobName = generateBlobName(
            assignment.course_id, 
            `assignments/${assignmentId}`, 
            file.originalname
          );
          
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          
          const uploadOptions = {
            blobHTTPHeaders: {
              blobContentType: file.mimetype,
              blobContentDisposition: `attachment; filename="${file.originalname}"`
            },
            metadata: {
              courseId: assignment.course_id.toString(),
              assignmentId: assignmentId.toString(),
              studentId: studentId.toString(),
              originalName: file.originalname,
              uploadDate: new Date().toISOString(),
              submissionType: 'assignment'
            }
          };
          
          await blockBlobClient.upload(file.buffer, file.buffer.length, uploadOptions);
          
          return {
            blobName: blobName,
            originalName: file.originalname,
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            url: getBlobUrl(blobName),
            uploadedAt: new Date().toISOString()
          };
        });
        
        submittedFiles = await Promise.all(uploadPromises);
        
      } catch (uploadError) {
        console.error('Azure upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload files to storage',
          error: uploadError.message
        });
      }
    }

    // Insert submission
    const [result] = await pool.execute(`
      INSERT INTO assignment_submissions 
      (assignment_id, student_id, submitted_files, submission_text, is_late, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, 'submitted', NOW())
    `, [
      assignmentId,
      studentId,
      JSON.stringify(submittedFiles),
      submissionText || null,
      isLate
    ]);

    // Update assignment submission count
    await pool.execute(
      'UPDATE assignments SET submission_count = submission_count + 1 WHERE id = ?',
      [assignmentId]
    );

    res.json({
      success: true,
      data: {
        submission_id: result.insertId,
        submitted_at: new Date(),
        is_late: isLate,
        status: 'submitted',
        submitted_files: submittedFiles
      },
      message: 'Assignment submitted successfully'
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

// Get student's submissions for a course
export const getStudentSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Verify student enrollment
    const [enrollmentCheck] = await pool.execute(
      'SELECT * FROM course_enrollment WHERE stu_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get all submissions for the course
    const [submissions] = await pool.execute(`
      SELECT 
        asub.*,
        a.max_points,
        a.due_date,
        cm.title as assignment_title,
        cm.course_id,
        t.fname as graded_by_name
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN course_materials cm ON a.course_material_id = cm.id
      LEFT JOIN teacher t ON asub.graded_by = t.teacher_id
      WHERE cm.course_id = ? AND asub.student_id = ?
      ORDER BY asub.submitted_at DESC
    `, [courseId, studentId]);

    // Format submissions with Azure URLs
    const formattedSubmissions = submissions.map(submission => {
      let submittedFiles = [];
      if (submission.submitted_files) {
        try {
          submittedFiles = JSON.parse(submission.submitted_files);
          // Ensure all files have proper Azure URLs
          submittedFiles = submittedFiles.map(file => ({
            ...file,
            url: file.url || getBlobUrl(file.blobName || file.path)
          }));
        } catch (e) {
          console.error('Error parsing submitted files:', e);
        }
      }

      return {
        id: submission.id,
        assignment_id: submission.assignment_id,
        assignment_title: submission.assignment_title,
        submitted_files: submittedFiles,
        submission_text: submission.submission_text,
        submitted_at: submission.submitted_at,
        is_late: submission.is_late,
        grade: submission.grade,
        max_points: submission.max_points,
        graded_by: submission.graded_by,
        graded_by_name: submission.graded_by_name,
        graded_at: submission.graded_at,
        feedback: submission.feedback,
        status: submission.status,
        attempt_number: submission.attempt_number,
        due_date: submission.due_date,
        percentage: submission.grade && submission.max_points ? 
          Math.round((submission.grade / submission.max_points) * 100) : null
      };
    });

    res.json({
      success: true,
      data: formattedSubmissions,
      message: 'Student submissions retrieved successfully'
    });

  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student submissions',
      error: error.message
    });
  }
};

// Get course info for enrolled student
export const getCourseInfo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Get course info with enrollment verification
    const [courseResult] = await pool.execute(`
      SELECT 
        c.*,
        t.fname,
        t.email as teacher_email,
        t.enroll_date
      FROM course c
      JOIN teacher t ON c.t_id = t.teacher_id
      JOIN course_enrollment ce ON c.course_id = ce.course_id
      WHERE c.course_id = ? AND ce.stu_id = ?
    `, [courseId, studentId]);

    if (courseResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you are not enrolled'
      });
    }

    const course = courseResult[0];

    // Get course statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN cm.material_type != 'assignment' THEN 1 END) as material_count,
        COUNT(CASE WHEN cm.material_type = 'assignment' THEN 1 END) as assignment_count,
        COUNT(asub.id) as submitted_count
      FROM course_materials cm
      LEFT JOIN assignments a ON cm.id = a.course_material_id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE cm.course_id = ? AND cm.is_published = TRUE
    `, [studentId, courseId]);

    res.json({
      success: true,
      data: {
        ...course,
        statistics: stats[0]
      },
      message: 'Course information retrieved successfully'
    });

  } catch (error) {
    console.error('Get course info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course information',
      error: error.message
    });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get enrolled courses with basic info
    const [enrolledCourses] = await pool.execute(`
      SELECT 
        c.course_id,
        c.course_name,
        c.description,
        c.grade,
        t.fname as instructor_name,
        t.lname as instructor_lastname
      FROM course_enrollment ce
      JOIN course c ON ce.course_id = c.course_id
      JOIN teacher t ON c.t_id = t.teacher_id
      WHERE ce.stu_id = ? 
      ORDER BY c.course_id DESC
    `, [studentId]);

    const formattedCourses = enrolledCourses.map(course => ({
      course_id: course.course_id,
      course_name: course.course_name,
      course_code: course.course_id,
      description: course.description,
      grade: course.grade,
      instructor: `${course.instructor_name} ${course.instructor_lastname}`.trim(),
      fname: course.instructor_name
    }));

    res.status(200).json({
      success: true,
      message: 'Enrolled courses retrieved successfully',
      data: formattedCourses,
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled courses',
      error: error.message
    });
  }
};

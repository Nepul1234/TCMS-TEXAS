import pool from '../utils/dbconn.js';

export const createCourseMaterial = async (req, res) => {
  try {
    const { 
      courseId, title, content, fileType, assignmentSettings, teacherId 
    } = req.body;
    
    // Validate required fields
    if (!courseId || !title || !content || !fileType || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, title, content, fileType, teacherId'
      });
    }
    
    // Direct SQL - Create course material
    const [materialResult] = await pool.execute(
      `INSERT INTO course_materials (course_id, teacher_id, title, content, material_type, is_published, order_index, publish_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [courseId, teacherId, title, content, fileType, true, 0, new Date()]
    );
    
    const materialId = materialResult.insertId;
    
    // If it's an assignment, create assignment record with direct SQL
    if (fileType === 'assignment' && assignmentSettings) {
      const { dueDate, dueTime, maxPoints, allowedFileTypes, maxFileSize, maxFiles, 
              instructions, allowLateSubmission, latePenalty } = assignmentSettings;
      
      // Validate assignment settings
      if (!dueDate || !dueTime || !allowedFileTypes || allowedFileTypes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required assignment fields: dueDate, dueTime, allowedFileTypes'
        });
      }
      
      const dueDatetime = new Date(`${dueDate}T${dueTime}`);
      
      // Direct SQL - Create assignment
      await pool.execute(
        `INSERT INTO assignments (course_material_id, due_date, max_points, allowed_file_types, 
                                 max_file_size_mb, max_files, instructions, allow_late_submission, 
                                 late_penalty_percent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [materialId, dueDatetime, maxPoints || 100, JSON.stringify(allowedFileTypes), 
         maxFileSize || 10, maxFiles || 1, instructions || '', allowLateSubmission || false, 
         latePenalty || 0]
      );
    }
    
    // Get the created material with assignment details (if applicable)
    const [finalMaterial] = await pool.execute(
      `SELECT cm.*, 
              CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as is_assignment,
              a.due_date, a.max_points
       FROM course_materials cm
       LEFT JOIN assignments a ON cm.id = a.course_material_id
       WHERE cm.id = ?`,
      [materialId]
    );
    
    res.status(201).json({
      success: true,
      data: finalMaterial[0],
      message: `${fileType === 'assignment' ? 'Assignment' : 'Material'} created successfully`
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course material',
      error: error.message
    });
  }
};

// Get materials for a course - Direct SQL
export const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Direct SQL - Get course materials with assignment info
    const [rows] = await pool.execute(
      `SELECT cm.*, u.fname, u.lname,
              CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as is_assignment,
              a.due_date, a.max_points, a.id as assignment_id
       FROM course_materials cm
       LEFT JOIN teacher u ON cm.teacher_id = u.teacher_id
       LEFT JOIN assignments a ON cm.id = a.course_material_id
       WHERE cm.course_id = ? 
       ORDER BY cm.order_index ASC, cm.created_at DESC`,
      [courseId]
    );
    
    res.json({
      success: true,
      data: rows,
      message: 'Course materials retrieved successfully'
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course materials',
      error: error.message
    });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id; // From auth middleware
    
    // Get material with assignment details (only if teacher owns it)
    const [rows] = await pool.execute(
      `SELECT cm.*, u.fname, u.lame,
              CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as is_assignment,
              a.id as assignment_id, a.due_date, a.max_points, a.allowed_file_types, 
              a.max_file_size_mb, a.max_files, a.instructions, a.allow_late_submission, 
              a.late_penalty_percent
       FROM course_materials cm
       LEFT JOIN users u ON cm.teacher_id = u.id
       LEFT JOIN assignments a ON cm.id = a.course_material_id
       WHERE cm.id = ? AND cm.teacher_id = ?`,
      [materialId, teacherId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or you do not have permission to access it'
      });
    }
    
    // Parse JSON fields if assignment
    const material = rows[0];
    if (material.is_assignment && material.allowed_file_types) {
      material.allowed_file_types = JSON.parse(material.allowed_file_types);
    }
    
    res.json({
      success: true,
      data: material,
      message: 'Material retrieved successfully'
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve material',
      error: error.message
    });
  }
};

export const updateCourseMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id; // From auth middleware
    const { title, content, fileAttachments, isPublished, orderIndex, assignmentSettings } = req.body;
    
    // Validate required fields and convert undefined to null
    const safeTitle = title || null;
    const safeContent = content || null;
    const safeFileAttachments = fileAttachments ? JSON.stringify(fileAttachments) : null;
    const safeIsPublished = isPublished !== undefined ? isPublished : false;
    const safeOrderIndex = orderIndex !== undefined ? orderIndex : 0;
    
    if (!safeTitle || !safeContent) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Check if material exists and belongs to teacher
    const [checkRows] = await pool.execute(
      'SELECT id, material_type FROM course_materials WHERE id = ? AND teacher_id = ?',
      [materialId, teacherId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or you do not have permission to update it'
      });
    }
    
    const materialType = checkRows[0].material_type;
    
    // Update course material - ensure no undefined values
    await pool.execute(
      `UPDATE course_materials 
       SET title = ?, content = ?, file_attachments = ?, is_published = ?, order_index = ?, 
           publish_date = CASE WHEN is_published = FALSE AND ? = TRUE THEN CURRENT_TIMESTAMP ELSE publish_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [safeTitle, safeContent, safeFileAttachments, safeIsPublished, safeOrderIndex, safeIsPublished, materialId]
    );
    
    // Update assignment if it exists and settings provided
    if (materialType === 'assignment' && assignmentSettings) {
      const { dueDate, dueTime, maxPoints, allowedFileTypes, maxFileSize, maxFiles, 
              instructions, allowLateSubmission, latePenalty } = assignmentSettings;
      
      // Validate assignment settings and convert undefined to safe values
      if (dueDate && dueTime && allowedFileTypes && allowedFileTypes.length > 0) {
        const dueDatetime = new Date(`${dueDate}T${dueTime}`);
        
        // Ensure all values are safe (no undefined)
        const safeMaxPoints = maxPoints !== undefined ? maxPoints : 100;
        const safeAllowedFileTypes = JSON.stringify(allowedFileTypes);
        const safeMaxFileSize = maxFileSize !== undefined ? maxFileSize : 10;
        const safeMaxFiles = maxFiles !== undefined ? maxFiles : 1;
        const safeInstructions = instructions || '';
        const safeAllowLateSubmission = allowLateSubmission !== undefined ? allowLateSubmission : false;
        const safeLatePenalty = latePenalty !== undefined ? latePenalty : 0;
        
        // Update assignment record
        await pool.execute(
          `UPDATE assignments 
           SET due_date = ?, max_points = ?, allowed_file_types = ?, max_file_size_mb = ?, 
               max_files = ?, instructions = ?, allow_late_submission = ?, late_penalty_percent = ?, 
               updated_at = CURRENT_TIMESTAMP
           WHERE course_material_id = ?`,
          [dueDatetime, safeMaxPoints, safeAllowedFileTypes, safeMaxFileSize, 
           safeMaxFiles, safeInstructions, safeAllowLateSubmission, safeLatePenalty, materialId]
        );
      }
    }
    
    // Get updated material
    const [updatedMaterial] = await pool.execute(
      `SELECT cm.*, 
              CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as is_assignment,
              a.due_date, a.max_points
       FROM course_materials cm
       LEFT JOIN assignments a ON cm.id = a.course_material_id
       WHERE cm.id = ?`,
      [materialId]
    );
    
    res.json({
      success: true,
      data: updatedMaterial[0],
      message: 'Material updated successfully'
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: error.message
    });
  }
};

export const deleteCourseMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id; // From auth middleware
    
    // Check if material exists and belongs to teacher
    const [checkRows] = await pool.execute(
      'SELECT id, title FROM course_materials WHERE id = ? AND teacher_id = ?',
      [materialId, teacherId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or you do not have permission to delete it'
      });
    }
    
    const materialTitle = checkRows[0].title;
    
    // Delete material (assignments will be deleted automatically due to foreign key cascade)
    await pool.execute('DELETE FROM course_materials WHERE id = ?', [materialId]);
    
    res.json({
      success: true,
      message: `Material "${materialTitle}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

export const toggleMaterialStatus = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id;
    
    // Get current status
    const [rows] = await pool.execute(
      'SELECT is_published, title FROM course_materials WHERE id = ? AND teacher_id = ?',
      [materialId, teacherId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    const currentStatus = rows[0].is_published;
    const newStatus = !currentStatus;
    const title = rows[0].title;
    
    // Update status
    await pool.execute(
      `UPDATE course_materials 
       SET is_published = ?, 
           publish_date = CASE WHEN ? = TRUE THEN CURRENT_TIMESTAMP ELSE publish_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, newStatus, materialId]
    );
    
    res.json({
      success: true,
      message: `Material "${title}" ${newStatus ? 'published' : 'unpublished'} successfully`,
      data: { is_published: newStatus }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material status',
      error: error.message
    });
  }
};

export const getMaterialStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;
    
    // Get material statistics for teacher's course
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_materials,
         COUNT(CASE WHEN material_type = 'lesson' THEN 1 END) as lessons,
         COUNT(CASE WHEN material_type = 'assignment' THEN 1 END) as assignments,
         COUNT(CASE WHEN material_type = 'notes' THEN 1 END) as notes,
         COUNT(CASE WHEN material_type = 'resource' THEN 1 END) as resources,
         COUNT(CASE WHEN is_published = TRUE THEN 1 END) as published,
         COUNT(CASE WHEN is_published = FALSE THEN 1 END) as drafts,
         AVG(view_count) as avg_views
       FROM course_materials cm
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.course_id = ? AND c.teacher_id = ?`,
      [courseId, teacherId]
    );
    
    res.json({
      success: true,
      data: stats[0],
      message: 'Material statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
};

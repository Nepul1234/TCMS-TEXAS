// Import necessary modules
import pool from "../utils/dbconn.js";
import { body } from 'express-validator';
import { validationResult } from 'express-validator';


export const getAllVirtualClasses = async (req, res) => {
  try {
    const query = `
      SELECT 
        class_id as id, 
        course_name as course, 
        DATE_FORMAT(class_date, '%Y-%m-%d') as date, 
        TIME_FORMAT(class_time, '%H:%i') as time, 
        meeting_link as link, 
        status,
        created_at,
        updated_at
      FROM virtual_classes
      ORDER BY class_date DESC, class_time DESC
    `;
    
    const [classes] = await pool.query(query);
    
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching virtual classes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch virtual classes', 
      error: error.message 
    });
  }
};


export const getVirtualClassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        class_id as id, 
        course_name as course, 
        DATE_FORMAT(class_date, '%Y-%m-%d') as date, 
        TIME_FORMAT(class_time, '%H:%i') as time, 
        meeting_link as link, 
        status,
        created_at,
        updated_at
      FROM virtual_classes
      WHERE class_id = ?
    `;
    
    const [classes] = await pool.query(query, [id]);
    
    if (classes.length === 0) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }
    
    return res.status(200).json(classes[0]);
  } catch (error) {
    console.error('Error fetching virtual class:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch virtual class', 
      error: error.message 
    });
  }
};


export const createVirtualClass = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { course, date, time, link, status = 'upcoming' } = req.body;
    
    // Validate required fields
    if (!course || !date || !time || !link) {
      return res.status(400).json({ 
        message: 'All fields are required: course, date, time, link' 
      });
    }

    const query = `
      INSERT INTO virtual_classes (
        course_name, 
        class_date, 
        class_time, 
        meeting_link, 
        status
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      course, 
      date, 
      time, 
      link, 
      status
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to create virtual class' });
    }
    
    // Get the newly created virtual class
    const [newClass] = await pool.query(`
      SELECT 
        class_id as id, 
        course_name as course, 
        DATE_FORMAT(class_date, '%Y-%m-%d') as date, 
        TIME_FORMAT(class_time, '%H:%i') as time, 
        meeting_link as link, 
        status,
        created_at,
        updated_at
      FROM virtual_classes
      WHERE class_id = ?
    `, [result.insertId]);
    
    return res.status(201).json({
      message: 'Virtual class created successfully',
      data: newClass[0]
    });
  } catch (error) {
    console.error('Error creating virtual class:', error);
    return res.status(500).json({ 
      message: 'Failed to create virtual class', 
      error: error.message 
    });
  }
};


export const updateVirtualClass = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { course, date, time, link, status } = req.body;
    
    // Check if class exists
    const [existingClass] = await pool.query(
      'SELECT * FROM virtual_classes WHERE class_id = ?', 
      [id]
    );
    
    if (existingClass.length === 0) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }
    
    // Build update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];
    
    if (course !== undefined) {
      updateFields.push('course_name = ?');
      queryParams.push(course);
    }
    
    if (date !== undefined) {
      updateFields.push('class_date = ?');
      queryParams.push(date);
    }
    
    if (time !== undefined) {
      updateFields.push('class_time = ?');
      queryParams.push(time);
    }
    
    if (link !== undefined) {
      updateFields.push('meeting_link = ?');
      queryParams.push(link);
    }
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }
    
    // No fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Create update query
    const updateQuery = `
      UPDATE virtual_classes 
      SET ${updateFields.join(', ')} 
      WHERE class_id = ?
    `;
    
    // Add class ID to query parameters
    queryParams.push(id);
    
    // Execute update query
    const [result] = await pool.query(updateQuery, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update virtual class' });
    }
    
    // Get the updated virtual class
    const [updatedClass] = await pool.query(`
      SELECT 
        class_id as id, 
        course_name as course, 
        DATE_FORMAT(class_date, '%Y-%m-%d') as date, 
        TIME_FORMAT(class_time, '%H:%i') as time, 
        meeting_link as link, 
        status,
        created_at,
        updated_at
      FROM virtual_classes
      WHERE class_id = ?
    `, [id]);
    
    return res.status(200).json({
      message: 'Virtual class updated successfully',
      data: updatedClass[0]
    });
  } catch (error) {
    console.error('Error updating virtual class:', error);
    return res.status(500).json({ 
      message: 'Failed to update virtual class', 
      error: error.message 
    });
  }
};


export const deleteVirtualClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if class exists
    const [existingClass] = await pool.query(
      'SELECT * FROM virtual_classes WHERE class_id = ?', 
      [id]
    );
    
    if (existingClass.length === 0) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }
    
    // Delete the class
    const query = 'DELETE FROM virtual_classes WHERE class_id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to delete virtual class' });
    }
    
    return res.status(200).json({
      message: 'Virtual class deleted successfully',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Error deleting virtual class:', error);
    return res.status(500).json({ 
      message: 'Failed to delete virtual class', 
      error: error.message 
    });
  }
};


export const updateClassStatus = async (req, res) => {
  try {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['upcoming', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value. Status must be one of: upcoming, completed, cancelled' 
      });
    }
    
    // Check if class exists
    const [existingClass] = await pool.query(
      'SELECT * FROM virtual_classes WHERE class_id = ?', 
      [id]
    );
    
    if (existingClass.length === 0) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }
    
    // Update only the status
    const query = 'UPDATE virtual_classes SET status = ? WHERE class_id = ?';
    const [result] = await pool.query(query, [status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update class status' });
    }
    
    return res.status(200).json({
      message: 'Class status updated successfully',
      id: parseInt(id),
      status
    });
  } catch (error) {
    console.error('Error updating class status:', error);
    return res.status(500).json({ 
      message: 'Failed to update class status', 
      error: error.message 
    });
  }
};

export const getStudentVirtualClasses = async (req, res) => {
  try {
    const { studentId } = req.params; // Get student ID from URL parameter
    
    // Query to get virtual classes for courses the student is enrolled in
    const query = `
      SELECT 
        vc.class_id as id, 
        c.course_name as course, 
        DATE_FORMAT(vc.class_date, '%Y-%m-%d') as date, 
        TIME_FORMAT(vc.class_time, '%H:%i') as time, 
        vc.meeting_link as link, 
        vc.status,
        vc.created_at,
        vc.updated_at
      FROM virtual_classes vc
      INNER JOIN course c ON vc.course_name = c.course_name
      INNER JOIN course_enrollment ce ON c.course_id = ce.course_id 
      WHERE ce.stu_id = ?
      ORDER BY vc.class_date DESC, vc.class_time DESC
    `;
    
    const [classes] = await pool.query(query, [studentId]);
    
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching student virtual classes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch student virtual classes', 
      error: error.message 
    });
  }
};

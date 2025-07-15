import pool from "../utils/dbconn.js";
import jwt from 'jsonwebtoken';
import errorHandler from "../utils/error.js";

// Middleware to verify JWT and extract user info (based on your existing auth)
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = decoded; // Contains: { id, name, role, email }
    next();
  });
};

// Helper function to get user ID from JWT token
const getUserIdFromAuth = (req) => {
  return req.user?.id;
};

// Get all events for the logged-in user
export const getAllEvents = async (req, res) => {
  // Apply authentication first
  authenticateUser(req, res, async () => {
    try {
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const query = `
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE student_id = ?
        ORDER BY start_date ASC
      `;
      
      const [events] = await pool.execute(query, [userId]);
      
      // Transform data to match frontend format
      const transformedEvents = events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
        category: event.category,
        extendedProps: {
          calendar: event.category,
          description: event.description
        }
      }));
      
      res.status(200).json({
        success: true,
        data: transformedEvents
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  });
};

// Get single event by ID
export const getEventById = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { id } = req.params;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      const query = `
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE id = ? AND student_id = ?
      `;
      
      const [events] = await pool.execute(query, [id, userId]);
      
      if (events.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or access denied'
        });
      }
      
      const event = events[0];
      const transformedEvent = {
        id: event.id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
        category: event.category,
        extendedProps: {
          calendar: event.category,
          description: event.description
        }
      };
      
      res.status(200).json({
        success: true,
        data: transformedEvent
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error.message
      });
    }
  });
};

// Create new event
export const createEvent = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { title, start, end, category = 'class', description, allDay = true } = req.body;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      // Validation
      if (!title || !start) {
        return res.status(400).json({
          success: false,
          message: 'Title and start date are required'
        });
      }
      
      // Validate category
      const validCategories = ['class', 'assignment', 'exam', 'termtest'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: class, assignment, exam, termtest'
        });
      }
      
      const query = `
        INSERT INTO events (student_id, title, start_date, end_date, category, description, all_day)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        userId,
        title,
        start,
        end || start,
        category,
        description || null,
        allDay
      ]);
      
      // Fetch the created event
      const [newEvent] = await pool.execute(`
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE id = ? AND student_id = ?
      `, [result.insertId, userId]);
      
      const transformedEvent = {
        id: newEvent[0].id.toString(),
        title: newEvent[0].title,
        start: newEvent[0].start,
        end: newEvent[0].end,
        allDay: newEvent[0].all_day,
        category: newEvent[0].category,
        extendedProps: {
          calendar: newEvent[0].category,
          description: newEvent[0].description
        }
      };
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: transformedEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error.message
      });
    }
  });
};

// Update event
export const updateEvent = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { id } = req.params;
      const { title, start, end, category, description, allDay } = req.body;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      // Check if event exists and belongs to the user
      const [existingEvent] = await pool.execute(
        'SELECT id FROM events WHERE id = ? AND student_id = ?', 
        [id, userId]
      );
      
      if (existingEvent.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or access denied'
        });
      }
      
      // Validate category if provided
      if (category) {
        const validCategories = ['class', 'assignment', 'exam', 'termtest'];
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category. Must be one of: class, assignment, exam, termtest'
          });
        }
      }
      
      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      
      if (title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }
      if (start !== undefined) {
        updateFields.push('start_date = ?');
        updateValues.push(start);
      }
      if (end !== undefined) {
        updateFields.push('end_date = ?');
        updateValues.push(end);
      }
      if (category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (allDay !== undefined) {
        updateFields.push('all_day = ?');
        updateValues.push(allDay);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }
      
      updateValues.push(id, userId);
      
      const query = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ? AND student_id = ?`;
      await pool.execute(query, updateValues);
      
      // Fetch updated event
      const [updatedEvent] = await pool.execute(`
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE id = ? AND student_id = ?
      `, [id, userId]);
      
      const transformedEvent = {
        id: updatedEvent[0].id.toString(),
        title: updatedEvent[0].title,
        start: updatedEvent[0].start,
        end: updatedEvent[0].end,
        allDay: updatedEvent[0].all_day,
        category: updatedEvent[0].category,
        extendedProps: {
          calendar: updatedEvent[0].category,
          description: updatedEvent[0].description
        }
      };
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: transformedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error.message
      });
    }
  });
};

// Delete event
export const deleteEvent = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { id } = req.params;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      // Check if event exists and belongs to the user
      const [existingEvent] = await pool.execute(
        'SELECT id FROM events WHERE id = ? AND student_id = ?', 
        [id, userId]
      );
      
      if (existingEvent.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or access denied'
        });
      }
      
      await pool.execute('DELETE FROM events WHERE id = ? AND student_id = ?', [id, userId]);
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error.message
      });
    }
  });
};

// Get events by date range
export const getEventsByDateRange = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { startDate, endDate } = req.query;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      const query = `
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE student_id = ? AND start_date >= ? AND start_date <= ?
        ORDER BY start_date ASC
      `;
      
      const [events] = await pool.execute(query, [userId, startDate, endDate]);
      
      const transformedEvents = events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
        category: event.category,
        extendedProps: {
          calendar: event.category,
          description: event.description
        }
      }));
      
      res.status(200).json({
        success: true,
        data: transformedEvents
      });
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  });
};

// Get events by category
export const getEventsByCategory = async (req, res) => {
  authenticateUser(req, res, async () => {
    try {
      const { category } = req.params;
      const userId = getUserIdFromAuth(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      const validCategories = ['class', 'assignment', 'exam', 'termtest'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: class, assignment, exam, termtest'
        });
      }
      
      const query = `
        SELECT 
          id,
          title,
          start_date as start,
          end_date as end,
          category,
          all_day,
          description,
          created_at,
          updated_at
        FROM events 
        WHERE student_id = ? AND category = ?
        ORDER BY start_date ASC
      `;
      
      const [events] = await pool.execute(query, [userId, category]);
      
      const transformedEvents = events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
        category: event.category,
        extendedProps: {
          calendar: event.category,
          description: event.description
        }
      }));
      
      res.status(200).json({
        success: true,
        data: transformedEvents
      });
    } catch (error) {
      console.error('Error fetching events by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  });
};
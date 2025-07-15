import errorHandler from "../utils/error.js";
import pool from '../utils/dbconn.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyTokenAndGetUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
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

    req.user = decoded;
    next();
  });
};

// Get all announcements for a student
export const getAnnouncements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Fetching announcements for user:', userId, 'Role:', userRole);

    let announcementsQuery;
    let queryParams = [];

      announcementsQuery = `
        SELECT DISTINCT 
          a.announcement_id,
          a.course_id,
          a.announcement as content,
          a.publisher_name as author,
          a.priority,
          a.published_date,
          c.course_name,
          c.course_id,
          CASE 
            WHEN a.course_id IS NULL THEN 'general'
            WHEN a.priority = 'high' THEN 'important'
            ELSE 'course'
          END as type
        FROM announcements a
        LEFT JOIN course c ON a.course_id = c.course_id
        WHERE 
          (
            a.course_id IN (
              SELECT ce.course_id 
              FROM course_enrollment ce 
              WHERE ce.stu_id = ?
            ) 
            OR a.course_id IS NULL
          )
        ORDER BY 
          a.priority = 'high' DESC,
          a.published_date DESC
        LIMIT 50
      `;
      queryParams = [userId];

    const [announcements] = await pool.execute(announcementsQuery, queryParams);

    // Format announcements for frontend
    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.announcement_id,
      title: announcement.course_name ? 
        `${announcement.course_name} - Announcement` : 
        'General Announcement',
      content: announcement.content,
      type: announcement.type,
      date: announcement.published_date || announcement.created_at,
      author: announcement.author,
      read: false, // can implement read status tracking later
      course: announcement.course_code || announcement.course_name || null,
      priority: announcement.priority
    }));

    res.status(200).json({
      success: true,
      data: formattedAnnouncements
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    next(errorHandler(500, 'Failed to fetch announcements'));
  }
};

// Mark announcement as read (optional feature)
export const markAnnouncementAsRead = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user.id;

    // You can implement a read_status table to track which announcements users have read
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('Error marking announcement as read:', error);
    next(errorHandler(500, 'Failed to mark announcement as read'));
  }
};

export { verifyTokenAndGetUser };
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getTutorAnnouncement = async (req, res, next) => {
  try {
    // Query to retrieve all announcements
    const [rows] = await pool.query("SELECT * FROM announcements");

    if (rows.length === 0) {
      return next(errorHandler(404, "Announcement not found"));
    }

    // Return the announcements
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};
export const createTutorAnnouncement = async (req, res, next) => {
  const { title, content, date } = req.body;

  try {
    // Insert the new announcement into the database
    const [result] = await pool.query(
      "INSERT INTO announcements (title, content, date) VALUES (?, ?, ?)",
      [title, content, date]
    );

    // Return the created announcement
    res.status(201).json({ id: result.insertId, title, content, date });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementwithCourseName = async (req, res, next) => {
  try {
    // Query to retrieve announcements with course names
    const query = `
      SELECT a.*, c.course_name 
      FROM announcements a 
      JOIN course c ON a.course_id = c.course_id
    `;
    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return next(errorHandler(404, "No announcements found"));
    }

    // Return the announcements with course names
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

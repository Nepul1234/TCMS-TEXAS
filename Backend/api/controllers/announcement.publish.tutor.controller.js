// utils/error.js and database/db.js should each export a default value
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";


export const setAnnouncementPublish = async (req, res, next) => {
  const { course_id, text, publisher_name, priority } = req.body; // Extract data from request body

  try {
    // Insert the announcement into the announcements table
    const [result] = await pool.query(
      `INSERT INTO announcements 
        (course_id, announcement, publisher_name, priority, published_date) 
       VALUES (?, ?, ?, ?, CURDATE())`,
      [course_id, text, publisher_name, priority]
    );

    if (result.affectedRows === 0) {
      return next(errorHandler(404, "Failed to publish the announcement"));
    }

    res.status(200).json({ message: "Announcement published successfully" });
  } catch (error) {
    next(error);
  }
};


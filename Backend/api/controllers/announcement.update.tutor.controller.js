// utils/error.js and database/db.js should each export a default value
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const AnnouncementUpdate = async (req, res, next) => {
  const { announcement_id, text, priority } = req.body; // Extract data from request body

  try {
    // Check whether the announcement exists
    const checkQuery = "SELECT * FROM announcements WHERE announcement_id = ?";
    const [announcement] = await pool.query(checkQuery, [announcement_id]);

    if (!announcement || announcement.length === 0) {
      res.status(404).json({ success: false, message: "Announcement not found" });
      return;
    }

    // Update the announcement
    const [result] = await pool.query(
      "UPDATE announcements SET announcement = ?, priority = ? WHERE announcement_id = ?",
      [text, priority, announcement_id]
    );

    if (result.affectedRows === 0) {
      return next(errorHandler(404, "Failed to update the announcement"));
    }

    res.status(200).json({ message: "Announcement updated successfully" });
  } catch (error) {
    next(error);
  }
};


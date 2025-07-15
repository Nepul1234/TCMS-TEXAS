// utils/error.js and database/db.js should each have a default export
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";


export const AnnouncementDeletion = async (req, res, next) => {
  const { announcement_id } = req.body; // Extract announcement_id from request body

  try {
    // Delete the announcement from the announcements table
    const [result] = await pool.query(
      "DELETE FROM announcements WHERE announcement_id = ?",
      [announcement_id]
    );

    if (result.affectedRows === 0) {
      return next(errorHandler(404, "Failed to delete the announcement"));
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// This code handles the deletion of an announcement by its ID.
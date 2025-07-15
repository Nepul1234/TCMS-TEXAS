import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const setTimeTables = async (req, res, next) => {
  const { grade, content } = req.body;

  try {
    const gde = parseInt(grade, 10);
    const [existingTimetable] = await pool.query(
      "SELECT * FROM timetable WHERE content = ?",
      [content]
    );

    if (existingTimetable.length > 0) {
      return next(errorHandler(400, "Timetable already exists"));
    }

    // Inserting the new timetable into the database
    await pool.query(
      "INSERT INTO timetable (grade, content) VALUES (?, ?)",
      [gde, content]
    );

    res.json({ message: "Timetable set successfully" });
  } catch (error) {
    next(error);
  }
};



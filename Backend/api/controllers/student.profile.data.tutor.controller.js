import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getStudentProfileData = async (req, res, next) => {
  try {
    const [studentProfile] = await pool.query(
      "SELECT * FROM student"
    );

    if (studentProfile.length === 0) {
      return next(errorHandler(404, "Student not found"));
    }

    res.json(studentProfile);
  } catch (error) {
    next(error);
  }
};


// utils/error.js and database/db.js should each export a default value
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import { parse } from "dotenv";

export const updateTeacherProfileData = async (req, res, next) => {
  const { fname, lname, teacher_id, email, tel_no, address, profile_picture } = req.body;
  const profile_pic = req.file ? req.file.buffer : null; 

  try {
    // Query to update the teacher profile data
    const [result] = await pool.query(
      "UPDATE teacher SET fname = ?, lname = ?, email = ?, tel_no = ?, address = ? ,profile_pic = ? WHERE teacher_id = ?",
      [fname, lname, email, tel_no, address,profile_pic, teacher_id]
    );
    if (result.affectedRows === 0) {
      return next(errorHandler(404, "Teacher not found or no changes made"));
    }
    // If a profile picture is provided, update it

    // Send a success message as a response
    res.status(200).json({ message: "Teacher profile updated successfully" });
  } catch (error) {
    next(error);
  }
};



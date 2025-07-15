
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getTeacherProfileData = async (req, res, next) => {
  const { tutor_id } = req.body;

  try {
    // Query to get the teacher profile data
    const [rows] = await pool.query( "SELECT * FROM teacher WHERE teacher_id = ?",[tutor_id] );

    if (rows.length === 0) {
      return next(errorHandler(404, "Teacher not found"));
    }
    const data = rows[0];
    // Convert the profile picture from a buffer to a base64 string
    if (data.profile_pic) {
      data.profile_pic = Buffer.from(data.profile_pic).toString('base64');
    } else {
      data.profile_pic = null; // Handle case where profile picture is not set
    }

    // Send the teacher profile data as a response
    res.status(200).json({data:data});
  } catch (error) {
    next(error);
  }
};


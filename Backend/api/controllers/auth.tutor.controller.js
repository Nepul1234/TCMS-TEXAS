import errorHandler from "../utils/error.js";
import pool from "../database/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Currently unused
import dotenv from "dotenv";

dotenv.config(); // To load .env variables if needed

export const signin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
      const [user] = await pool.query(
      "SELECT * FROM teacher WHERE teacher_id = ?",
      [username]
    );
    if(user.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      if (!isPasswordValid) {
        return next(errorHandler(400, 'Password is incorrect'));
      }
      else{
        const token = jwt.sign(
        { id: user[0].teacher_id, name:user[0].fname, role: 'teacher' },
        "Testing", // Replace with process.env.JWT_SECRET in production
         { expiresIn: "1d" });
         res.json({ token, user: { 
                 id: user[0].teacher_id, 
                  role: user[0].role 
             } 
          });

      }
    }

    if (user.length === 0) {
      return next(errorHandler(400, 'User not found'));
    }

    
    
  } catch (error) {
    next(error);
  }
};



import express from 'express'
import { setStudentAttendance, getStudentAttendance } from "../controllers/student.attendance.controller.js";
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/setStudentAttendance',verifyToken,setStudentAttendance);
router.get('/getStudentAttendance',verifyToken, getStudentAttendance); // Assuming you have a method to get attendance


export default router;

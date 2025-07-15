import express from 'express'
import { adminProfileData,studentProfileData,teacherProfileData, getAllTeacherData,getSuperAdminProfileData } from "../controllers/profile.data.controller.js";
import { verifyToken } from '../controllers/auth.controller.js';
const router = express.Router()

router.post('/adminProfileData', verifyToken,adminProfileData);
router.get('/studentProfileData',verifyToken, studentProfileData);  
router.get('/teacherProfileData',verifyToken, teacherProfileData);
router.get('/getAllTeacherData',verifyToken, getAllTeacherData);
router.post('/getSuperAdminData', getSuperAdminProfileData); // Assuming this is for super admin data

export default router;
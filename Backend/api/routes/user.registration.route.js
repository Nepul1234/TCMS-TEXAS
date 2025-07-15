import express from 'express'
import { registerNewStudent,registerNewTeacher,registerNewCourse, registerNewAdmin } from "../controllers/user.registration.controller.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();


router.post('/registerStudent',upload.single('profile_picture'),registerNewStudent);
router.post('/registerTeacher',upload.single('profile_picture'),registerNewTeacher);
router.post('/registerCourse',registerNewCourse);
router.post('/registerEmployee',upload.single('profile_picture'),registerNewAdmin);

export default router;

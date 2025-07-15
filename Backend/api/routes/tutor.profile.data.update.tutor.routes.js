import express from 'express';
import {updateTeacherProfileData} from '../controllers/tutor.profile.data.update.tutor.controller.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Route to update teacher profile data
router.put('/update.tutor.profile.data',upload.single("profile_picture"),updateTeacherProfileData);





export default router;

import {getStudentProfileUpdate} from '../controllers/student.profile.update.controller.js';

import { Router } from 'express';
const router = Router();
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/get_profile_update',getStudentProfileUpdate);

export default router;
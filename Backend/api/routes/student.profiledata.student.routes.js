import {getStudentProfileData} from '../controllers/student.profiledata.fetch.controller.js';
import { Router } from 'express';


const router = Router();
router.post('/getStudentProfileData', getStudentProfileData);

export default router;

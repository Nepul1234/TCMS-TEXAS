import express from 'express';
import {getTeacherProfileData} from '../controllers/tutor.profile.data.tutor.controller.js';

const router = express.Router();

router.post('/get_tutor_profile_data', getTeacherProfileData);

export default router;

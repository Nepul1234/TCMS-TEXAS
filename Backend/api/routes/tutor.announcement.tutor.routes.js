import express from 'express';
import {getTutorAnnouncement} from '../controllers/tutor.announcement.tutor.controller.js';
import { getAnnouncementwithCourseName } from '../controllers/tutor.announcement.tutor.controller.js';    

const router = express.Router();

router.get('/getAnnouncements', getTutorAnnouncement);
router.get('/getAnnouncementwithCourseName', getAnnouncementwithCourseName);





export default router;

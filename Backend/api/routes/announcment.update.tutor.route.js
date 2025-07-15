import express from 'express';
import {AnnouncementUpdate} from '../controllers/announcement.update.tutor.controller.js';

const router = express.Router();

router.put('/updateAnnouncement', AnnouncementUpdate);

export default router;

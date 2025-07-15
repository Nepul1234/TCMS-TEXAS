import express from 'express';
import { AnnouncementDeletion } from '../controllers/announcement.deletion.tutor.controller.js';

const router = express.Router();

router.delete('/deleteAnnouncement', AnnouncementDeletion);

export default router;

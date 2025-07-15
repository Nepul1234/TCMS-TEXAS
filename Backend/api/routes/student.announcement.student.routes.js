// routes/announcementRoutes.js
import express from 'express';
import {
  getAnnouncements,
  markAnnouncementAsRead,
  verifyTokenAndGetUser
} from '../controllers/student.announcement.controller.js';

const router = express.Router();

router.get('/', verifyTokenAndGetUser, getAnnouncements);

// PUT /api/announcements/:announcementId/read - Mark announcement as read
router.put('/:announcementId/read', verifyTokenAndGetUser, markAnnouncementAsRead);

export default router;
import express from 'express';
import {setAnnouncementPublish} from '../controllers/announcement.publish.tutor.controller.js';

const router = express.Router();

router.post('/setNewAnnouncement', setAnnouncementPublish);


export default router;

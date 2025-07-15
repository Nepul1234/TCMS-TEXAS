import express from 'express';
import { getSuperAdminNotices,createSuperAdminNotice } from '../controllers/admin.notices.controller.js';

const router = express.Router();

router.get('/getAllSuperAdminNotices',getSuperAdminNotices);
router.post('/addSuperAdminNotice', createSuperAdminNotice); // Assuming you have a method to add notices


export default router;

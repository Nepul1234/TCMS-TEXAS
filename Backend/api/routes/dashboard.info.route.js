import express from 'express'
import { getAdminDashboardInfo,getMonthlyIncome } from '../controllers/admin.dashboard.info.controller.js';

const router = express.Router()

router.get('/getDashboardInfo', getAdminDashboardInfo);
router.get('/getMonthlyIncome', getMonthlyIncome);


export default router;
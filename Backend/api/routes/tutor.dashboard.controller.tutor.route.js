import express from "express";
import { getUpcommingVirtualClasses } from "../controllers/tutor.dashboard.tutor.controller.js";
import {getTutorDashboardData} from "../controllers/tutor.dashboard.tutor.controller.js";


const router = express.Router();
// Route to get tutor dashboard data
router.get("/getTutorDashboardData", getTutorDashboardData);
router.get("/getupcomingVirtualClasses", getUpcommingVirtualClasses);
// Export the router
export default router;      



import express from "express";
import { getStudentProfileData } from "../controllers/student.profile.data.tutor.controller.js";

const router = express.Router();

router.get("/get.student.profile.data", getStudentProfileData);


// Export the router
export default router;
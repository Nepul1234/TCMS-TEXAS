import express from "express";
import {getTutorEnrolledCourses} from "../controllers/tutor.enrolled.courses.tutor.controller.js";

const router = express.Router();

router.post("/getByTutorId", getTutorEnrolledCourses);


// Export the router
export default router;
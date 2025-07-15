import {registerNewCourse} from "../controllers/course.registration.controller.js";
import { Router } from 'express';

const router = Router();
// The Route to register a new course
router.post('/course_registration', registerNewCourse);

export default router;

import {getCourseView, enrollCourseRequest} from '../controllers/course.view.controller.js';

import { Router } from 'express';

const router = Router();

router.get('/getCourseView', getCourseView);
router.post('/enrollCourseRequest', enrollCourseRequest);

export default router;
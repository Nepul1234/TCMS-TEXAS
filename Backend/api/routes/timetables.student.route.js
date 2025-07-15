import {setTimeTables} from '../controllers/timetables.controller.js';
import { Router } from 'express';
const router = Router();

router.post('/set', setTimeTables);

export default router;
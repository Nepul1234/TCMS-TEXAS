import express from 'express';
import { deleteTimetable, getTimetable ,setTimeTable, updateTimeTable} from '../controllers/timetable.controller.js';

const router = express.Router();

router.get('/getTimetable', getTimetable);
router.post('/setTimetable', setTimeTable);
router.put('/updateTimetable/:timeTableId', updateTimeTable); 
router.delete('/deleteTimetable/:id',deleteTimetable);

export default router;
import {newStudentPayment} from '../controllers/student.payment.controller.js';
import { Router } from 'express';
const router = Router();

router.post('/student_payment',newStudentPayment);

export default router;
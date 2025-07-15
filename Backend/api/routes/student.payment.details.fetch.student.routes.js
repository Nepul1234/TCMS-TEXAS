import {setStudentPaymentDetails} from '../controllers/student.payment.details.fetch.controller.js';
import { Router } from 'express';
const router = Router();


router.post('/update_student_payment',setStudentPaymentDetails);

export default router;

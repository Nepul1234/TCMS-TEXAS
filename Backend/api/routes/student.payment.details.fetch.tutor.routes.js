import { setStudentPaymentDetails } from '../controllers/student_payment_details_fetch.js';
import { Router } from 'express';

const router = Router();

router.post('/update_student_payment',setStudentPaymentDetails);

export default router;

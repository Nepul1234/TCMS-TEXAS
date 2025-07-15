import {getStudentPaymentDetails} from '../controllers/student.payment.details.controller.js';
import { Router } from 'express';
const router = Router();

router.post('/student_payment_details', getStudentPaymentDetails);

export default router;
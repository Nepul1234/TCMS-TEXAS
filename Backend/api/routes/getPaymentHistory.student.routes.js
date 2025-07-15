import {getStudentPaymentDetailsById} from "../controllers/student.payment.details.byId.controller.js";
import { Router } from 'express';

const router = Router();

router.post('/getStudentPaymentDetailsById', getStudentPaymentDetailsById);

export default router;
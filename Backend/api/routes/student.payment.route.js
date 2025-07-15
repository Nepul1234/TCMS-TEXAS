import express from 'express'
import { getStudentPaymentsDetails,setStudentPrevPaymentDetails,setStudentPaymentDetails} from '../controllers/student.payments.controller.js'
import { verifyToken } from '../utils/verifyUser.js'

const router = express.Router();

router.post('/getStudentPaymentDetails',verifyToken, getStudentPaymentsDetails);
router.post('/setStudentPrevPaymentDetails',verifyToken,setStudentPrevPaymentDetails);
router.post('/setStudentPaymentDetails',verifyToken,setStudentPaymentDetails);

export default router;
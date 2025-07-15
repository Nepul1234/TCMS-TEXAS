import express from 'express'
import { setIncomeExpenseDetails, getIncomeExpenseDetails, getIncomeExpenseDetailsForYear, getMonthlyDataForReporting } from '../controllers/IncomeExpense.controller.js';
import multer from 'multer';
import { verifyToken } from '../utils/verifyUser.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const router = express.Router()

router.post('/setIncomeExpenseDetails',upload.single('receipt'),verifyToken, setIncomeExpenseDetails);
router.get('/getIncomeExpenseDetails',verifyToken, getIncomeExpenseDetails);
router.post('/getIncomeExpenseDetailsByYear',verifyToken,getIncomeExpenseDetailsForYear);
router.post('/getMonthlyDataForReporting',verifyToken, getMonthlyDataForReporting);

export default router;
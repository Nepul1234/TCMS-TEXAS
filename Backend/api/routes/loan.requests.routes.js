import express from 'express';
import {  getLoanRequests,getAllLoanStaffDetails, setLoanRequest, deleteLoanRequest } from '../controllers/loan.requests.controller.js';
import { verifyToken } from '../utils/verifyUser.js';   


const router = express.Router();

router.get('/getAllLoanRequests',verifyToken,getLoanRequests);
router.get('/getAllStaffDetails',verifyToken,getAllLoanStaffDetails);
router.post('/setLoanRequest',verifyToken,setLoanRequest);
router.delete('/deleteLoanRequest',verifyToken, deleteLoanRequest);

export default router;
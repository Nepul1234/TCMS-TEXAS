import express from 'express';
import {signin, resetPassword, verifyOtp, updatePassword, verifyToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/forgot-password',resetPassword);
router.post('/verify-otp',verifyOtp);
router.post('/reset-password',updatePassword);
router.post('/verifyToken', verifyToken);


export default router;

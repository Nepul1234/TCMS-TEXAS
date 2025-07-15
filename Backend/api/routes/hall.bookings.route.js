import express from 'express'
import { getAllBookings, updateBookingDetails,getRecentBookings } from '../controllers/hall.bookings.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router()


router.get('/getAllBookings',verifyToken,getAllBookings); 
router.put('/updateBookingStatus',verifyToken,updateBookingDetails);
router.get('/getRecentBookings', verifyToken,getRecentBookings); // Assuming you have a method to get recent bookings

export default router;
import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";
import { stat } from "fs";

export const getAllBookings = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM hall_booking_requests ORDER BY request_date DESC");
        if (rows.length === 0) {
            return next(errorHandler(404, 'No bookings found'));
        }
        res.status(200).json({ bookings: rows });
    } catch (error) {
        next(error);
    }
}

export const updateBookingDetails = async (req, res, next) => {
    const { id, status } = req.body;
    try {
        const [existingBooking] = await pool.query("SELECT * FROM hall_booking_requests WHERE id = ?", [id]);
        if (existingBooking.length === 0) {
            return next(errorHandler(404, 'Booking not found'));
        }
        await pool.query("UPDATE hall_booking_requests SET status = ? WHERE id = ? ", [status, id]);
        res.status(200).json({ message: 'Booking details updated successfully' });
    } catch (error) {
        next(error);
    }
}

export const getRecentBookings = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM hall_booking_requests ORDER BY request_date DESC LIMIT 5");
        if (rows.length === 0) {
            return next(errorHandler(404, 'No recent bookings found'));
        }
        res.status(200).json({ recentBookings: rows });
    } catch (error) {
        next(error);
    }
}
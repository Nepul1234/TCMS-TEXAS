import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventsByCategory
} from '../controllers/student.event.controller.js';

const router = express.Router();


// GET /api/events - Get all events
router.get('/', getAllEvents);

// GET /api/events/date-range?startDate=2024-01-01&endDate=2024-12-31 - Get events by date range
router.get('/date-range', getEventsByDateRange);

// GET /api/events/category/:category - Get events by category
router.get('/category/:category', getEventsByCategory);

// GET /api/events/:id - Get single event by ID
router.get('/:id', getEventById);

// POST /api/events - Create new event
router.post('/', createEvent);

// PUT /api/events/:id - Update event
router.put('/:id', updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', deleteEvent);

export default router;
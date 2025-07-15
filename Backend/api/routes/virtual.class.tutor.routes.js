import express from 'express';
import { body } from 'express-validator';
import {
  getAllVirtualClasses,
  getVirtualClassById,
  createVirtualClass,
  updateVirtualClass,
  deleteVirtualClass,
  updateClassStatus,
  getStudentVirtualClasses
} from '../controllers/virtual.class.tutor.controller.js';

const router = express.Router();

// Validation middleware for creating virtual classes
const createVirtualClassValidation = [
  body('course')
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format (YYYY-MM-DD)'),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('link')
    .notEmpty()
    .withMessage('Meeting link is required')
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(['upcoming', 'completed', 'cancelled'])
    .withMessage('Status must be one of: upcoming, completed, cancelled')
];

// Validation middleware for updating virtual classes
const updateVirtualClassValidation = [
  body('course')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format (YYYY-MM-DD)'),
  
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('link')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(['upcoming', 'completed', 'cancelled'])
    .withMessage('Status must be one of: upcoming, completed, cancelled')
];

// Validation middleware for updating class status
const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['upcoming', 'completed', 'cancelled'])
    .withMessage('Status must be one of: upcoming, completed, cancelled')
];

// Parameter validation middleware
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      message: 'Invalid ID parameter. ID must be a valid number.' 
    });
  }
  next();
};

const validateStudentIdParam = (req, res, next) => {
  const { studentId } = req.params;
  if (!studentId || studentId.trim().length === 0) {
    return res.status(400).json({ 
      message: 'Invalid student ID parameter. Student ID cannot be empty.' 
    });
  }
  next();
};


router.get('/', getAllVirtualClasses);


router.get('/:id', validateIdParam, getVirtualClassById);


router.post('/', createVirtualClassValidation, createVirtualClass);

router.put('/:id', validateIdParam, updateVirtualClassValidation, updateVirtualClass);


router.delete('/:id', validateIdParam, deleteVirtualClass);

router.patch('/:id/status', validateIdParam, updateStatusValidation, updateClassStatus);

router.get('/student/:studentId', validateStudentIdParam, getStudentVirtualClasses);

export default router;
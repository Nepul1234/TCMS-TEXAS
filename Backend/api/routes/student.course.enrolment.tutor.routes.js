const express = require('express');
const courseEnrollmentController = require('../controllers/course.enrollment.controller');

const router = express.Router();

// Enroll student in a course
router.post('/students_enrold_courses',getCourseEnrollmentByID);





module.exports = router;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import profileUpdateRoutes from './routes/profile.update.route.js';
import profileDataRoutes from './routes/profile.data.route.js';
import userRegistrationRoutes from './routes/user.registration.route.js';
import courseEnrollmentRoutes from './routes/course.enrollment.admin.route.js';
import studentPaymentRoutes from './routes/student.payment.route.js';
import studentAttendaceRoutes from './routes/studnet.attendance.route.js'
import dashboardInfoRoutes from './routes/dashboard.info.route.js';
import userDataRoutes from './routes/user.data.route.js';
import incomeExpenseRoutes from './routes/incomeExpense.route.js';
import timeTableRoutes from './routes/timetable.routes.js';
import { verifyToken } from './utils/verifyUser.js';
import loanRequestsRoutes from './routes/loan.requests.routes.js';
import hallBookingRoutes from './routes/hall.bookings.route.js';
import adminNoticesRoutes from './routes/admin.notices.routes.js';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { initializeAzureStorage, testAzureConnection } from './config/azureStorage.js';
import registrationrouter from "./routes/register.student.routes.js";
import courseRegistrationRouter from "./routes/course.registration.student.routes.js";
import studentPaymentRouter from "./routes/student.payment.student.routes.js";
import getStudentPaymentDetailsRouter from "./routes/student.payement.details.student.routes.js";
import setStudentPaymentDetailsRouter from "./routes/student.payment.details.fetch.student.routes.js";
// import setTimeTablesRouter from "./routes/timetables.student.routes.js";
import getCourseEnrollmentRouter from "./routes/course.enrollement.student.routes.js";
import getCourseView from "./routes/course.view.student.routes.js";
import getStudentPaymentByIdRouter from "./routes/getPaymentHistory.student.routes.js";
import getStudentProfileUpdateRouter from "./routes/student.profile.update.student.routes.js";
import getStudentProfileDataRouter from "./routes/student.profiledata.student.routes.js";
import courseViewRouter from "./routes/course.view.student.routes.js";
import scheduleRouter from "./routes/class.schedule.student.routes.js"; // Importing the schedule router
import virtualClasses from "./routes/virtual.class.student.routes.js"
import azureBlobRoutes from "./routes/azure.file.student.routes.js";
import getTeacherCoursesRouter from "./routes/course.teacher.student.routes.js";
import materialRoutes from "./routes/course.material.student.routes.js";
import studentCourseRoutes from "./routes/student.course.student.routes.js";
import { authenticateToken, requireRole } from "./utils/authMiddleware.js";
import eventRoutes from "./routes/student.event.student.routes.js";
import dashboardRoutes from "./routes/student.dashboard.metrics.student.routes.js";
import announcementRoutes from "./routes/student.announcement.student.routes.js";
import studentResultsRoutes from "./routes/student.results.student.routes.js";
import quizStudentRoutes from "./routes/quiz.stu.student.routes.js";
import getTutorProfileDataRouter from "./routes/tutor.profile.data.tutor.routes.js";
import updateTutorProfileDataRouter from "./routes/tutor.profile.data.update.tutor.routes.js";
import getTutorEnrolledCoursesRouter from "./routes/tutor.courses.tutor.routes.js";
import getTutorAnnouncementRouter from "./routes/tutor.announcement.tutor.routes.js";
import setAnnouncementPublish from "./routes/announcement.publisher.tutor.routes.js";
import getVirtualClasses from "./routes/virtual.class.tutor.routes.js";
import announcementUpdate from "./routes/announcment.update.tutor.route.js";
import announcementDelete from "./routes/announcement.deletion.tutor.routes.js";
import getStudentProfileData from "./routes/student.profile.data.tutor.routes.js";
import getCourseEnrollmentByID from "./routes/course.enrollement.tutor.routes.js";
import tutorEarningsCalculationRouter from "./routes/tutor.earnings.calculations.tutor.route.js";
import getTutorDashboardDataRouter from "./routes/tutor.dashboard.controller.tutor.route.js";
import getAllStudentMarksRouter from "./routes/tutor.grading.tutor.route.js";

import quizRoutes from "./routes/quiz.routes.js";
import quizAnalyticsRoutes from "./routes/quiz.analytics.routes.js"; // Adjust path according to your project structure

dotenv.config();

const app = express();

// Azure-specific configurations
const PORT = process.env.PORT || 8080; // Azure uses PORT environment variable
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for Azure App Service
app.set('trust proxy', 1);

// CORS configuration for Azure
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins based on environment
    const allowedOrigins = NODE_ENV === 'production' 
      ? [
        process.env.FRONTEND_URL,
        /^https:\/\/mango-pond-0f8a83210\.2\.azurestaticapps\.net$/,
        /\.azurestaticapps\.net$/
      ]
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Enhanced logging for Azure
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware enhanced for Azure
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"] // Add your API domains
    }
  }
}));

app.use(compression());

// Enhanced rate limiting for Azure
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 500, // Stricter in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health'
});
app.use('/api/', limiter);

// Initialize Azure Storage on startup
let azureInitialized = false;
const initializeServices = async () => {
  try {
    await initializeAzureStorage();
    azureInitialized = true;
    console.log('Azure services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Azure services:', error);
    azureInitialized = false;
  }
};

// Health check endpoint for Azure
app.get('/api/health', async (req, res) => {
  try {
    const azureConnected = await testAzureConnection();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      services: {
        azureBlob: azureConnected ? 'Connected' : 'Disconnected',
        azureInitialized: azureInitialized
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World! API is running on Azure',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Admin routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileUpdateRoutes);
app.use('/api/profileData', profileDataRoutes);
app.use('/api/register', userRegistrationRoutes);
app.use('/api/courses', courseEnrollmentRoutes);
app.use('/api/payments', studentPaymentRoutes);
app.use('/api/attendance', studentAttendaceRoutes);
app.use('/api/dashboard', dashboardInfoRoutes);
app.use('/api/userData', userDataRoutes);
app.use('/api/incomeExpense', incomeExpenseRoutes);
app.use('/api/timetables', timeTableRoutes);
app.use('/api/loanRequests', loanRequestsRoutes);
app.use('/api/hallBookings', hallBookingRoutes);
app.use('/api/notices', adminNoticesRoutes);

// Student routes
app.use("/api/registration", registrationrouter);
app.use("/api/course_registration", courseRegistrationRouter);
app.use("/api/student_payment", studentPaymentRouter);
app.use("/api/student_payment_details", getStudentPaymentDetailsRouter);
app.use("/api/update_student_payment", setStudentPaymentDetailsRouter);
app.use("/api/get_course_enrollment", getCourseEnrollmentRouter);
app.use("/api/course_view", getCourseView);
app.use("/api/get_student_payment_details_byId", getStudentPaymentByIdRouter);
app.use("/api/get_profile_update", getStudentProfileUpdateRouter);
app.use("/api/get_student_profile_data", getStudentProfileDataRouter);
app.use("/api/course_view", courseViewRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/virtual-classes', virtualClasses);
app.use('/api/files', authenticateToken, requireRole(['teacher']), azureBlobRoutes);
app.use('/api/courses', authenticateToken, requireRole(['teacher', 'admin']), getTeacherCoursesRouter);
app.use('/api/materials', authenticateToken, requireRole(['teacher', 'admin']), materialRoutes);
app.use('/api/student-courses', authenticateToken, studentCourseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements/students', announcementRoutes);
app.use('/api/student-results', studentResultsRoutes);
app.use('/api/quiz', quizStudentRoutes);

// Tutor routes
app.use("/api/get.student.profile.data.routes", getStudentProfileData);
app.use("/api/update.tutor.profile.data", updateTutorProfileDataRouter);
app.use("/api/get_tutor_profile_data", getTutorProfileDataRouter);
app.use("/api/getTutorcoursesGetByTutorId", getTutorEnrolledCoursesRouter);
app.use("/api/getTutorAnnouncement", getTutorAnnouncementRouter);
app.use("/api/PublishAnnouncement", setAnnouncementPublish);
app.use("/api/updateAnnouncements", announcementUpdate);
app.use("/api/deleteAnnouncements", announcementDelete);
app.use("/api/getAllVirtualClasses", getVirtualClasses);
app.use("/api/get_course_enrollment", getCourseEnrollmentByID);
app.use("/api/get_tutor_earnings", tutorEarningsCalculationRouter);
app.use("/api/get_tutor_dashboard_data", getTutorDashboardDataRouter);
app.use("/api/get_all_student_marks", getAllStudentMarksRouter);

// Quiz routes
app.use("/api", quizRoutes);
app.use('/api/quiz-analytics', quizAnalyticsRoutes);
app.use('/api/quiz', quizStudentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' 
    ? (err.statusCode ? err.message : 'Internal Server Error')
    : err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await initializeServices();
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Azure services initialized: ${azureInitialized}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
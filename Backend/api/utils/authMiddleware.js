import jwt from 'jsonwebtoken';
import pool from './dbconn.js';


export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 Decoded token:', decoded);
    
    // Handle your specific token structure
    const userId = decoded.id || decoded.userId || decoded.user_id;
    const userRole = decoded.role;
    const userName = decoded.name;
    const userEmail = decoded.email;
    
    if (!userId) {
      console.error('❌ No user ID found in token payload:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure - missing user ID'
      });
    }
    
    console.log('🔍 Looking for user with ID:', userId, 'Role:', userRole);
    
    let user = null;
    let actualRole = null;
    
    try {
      const [studentRows] = await pool.execute(
        'SELECT * FROM student WHERE stu_id = ?',
        [userId]
      );
      
      if (studentRows.length > 0) {
        user = studentRows[0];
        actualRole = 'student';
        console.log('👨‍🎓 User found in student table:', user.stu_id);
      }
    } catch (error) {
      console.log('⚠️ Student table query failed:', error.message);
    }
    
    if (!user) {
      try {
        const [teacherRows] = await pool.execute(
          'SELECT * FROM teacher WHERE teacher_id = ?',
          [userId]
        );
        
        if (teacherRows.length > 0) {
          user = teacherRows[0];
          actualRole = 'teacher';
          console.log('👨‍🏫 User found in teacher table:', user.teacher_id);
        }
      } catch (error) {
        console.log('⚠️ Teacher table query failed:', error.message);
      }
    }
    
    // If user not found in database tables
    if (!user) {
      console.log('❌ User not found in database with ID:', userId);
      
      // For development, we can create a virtual user based on token
      // This is temporary until you fix the authentication system
      console.log('🚨 Creating virtual user from token for development');
      
      user = {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      };
      
      actualRole = userRole;
    }
    
    // Create normalized user object
    let normalizedId;
    if (actualRole === 'student') {
      normalizedId = user.stu_id || user.student_id || user.id || userId;
    } else if (actualRole === 'teacher') {
      normalizedId = user.teacher_id || user.id || userId;
    } else {
      normalizedId = userId;
    }
    
    req.user = {
      ...user,
      id: normalizedId,
      role: actualRole || userRole,
      email: user.email || user.Email || userEmail,
      name: user.name || user.fname || user.Fname || userName,
      first_name: user.fname || user.Fname,
      last_name: user.lname || user.Lname,
    };
    
    // console.log('✅ Final req.user:', {
    //   id: req.user.id,
    //   role: req.user.role,
    //   email: req.user.email,
    //   name: req.user.name
    // });
    
    next();
    
  } catch (error) {
    console.error('💥 Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Updated student requirement middleware with better logging
export const requireStudent = (req, res, next) => {
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'student') {
    console.log('❌ Access denied. User role:', req.user.role, 'Required: student');
    return res.status(403).json({
      success: false,
      message: `Student access required. Your role: ${req.user.role}`
    });
  }
  
  console.log('✅ Student access granted');
  next();
};

// Debug endpoint to check authentication
export const debugAuth = (req, res) => {
  res.json({
    success: true,
    message: 'Authentication debug info',
    data: {
      user: req.user,
      headers: req.headers.authorization ? 'Token present' : 'No token',
      timestamp: new Date().toISOString()
    }
  });
};

// Role-based access control middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    next();
  };
};

// Export the functions
export default {
  authenticateToken,
  requireStudent,
  requireRole,
  debugAuth
};
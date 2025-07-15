// utils/studentCourseApiHelpers.js - Production Version

export const studentCourseApiHelpers = {
  // Get auth token from localStorage
  getToken: () => {
    return  localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Generic API call wrapper
  call: async (endpoint, options = {}) => {
    const token = studentCourseApiHelpers.getToken();
    
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get enrolled courses - NEW METHOD
  getEnrolledCourses: async () => {
    return studentCourseApiHelpers.call('/student-courses/enrolled');
  },

  // Get course information - Handles your backend response structure
  getCourseInfo: async (courseId) => {
    try {
      const result = await studentCourseApiHelpers.call(`/student-courses/${courseId}/info`);
      
      // Transform the response to match frontend expectations
      if (result.success && result.data) {
        const transformedData = {
          ...result.data,
          teacher_name: result.data.fname || result.data.teacher_name || 'Unknown',
          course_name: result.data.course_name || 'Course',
          statistics: result.data.statistics || {
            material_count: 0,
            assignment_count: 0,
            submitted_count: 0
          }
        };
        
        return {
          success: true,
          data: transformedData,
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      console.error('getCourseInfo failed:', error.message);
      throw error;
    }
  },

  // Get course materials
  getCourseMaterials: async (courseId) => {
    return studentCourseApiHelpers.call(`/student-courses/${courseId}/materials`);
  },

  // Download material file from Azure Blob Storage
  downloadMaterialFile: async (materialId, fileIndex) => {
    const token = studentCourseApiHelpers.getToken();
    
    try {
      const response = await fetch(`/api/student-courses/materials/${materialId}/download/${fileIndex}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Download failed');
      }

      // Handle redirect to Azure Blob Storage
      if (response.redirected || response.type === 'opaqueredirect') {
        window.open(response.url, '_blank');
        return { success: true, message: 'File download started' };
      }

      // Handle direct file stream
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  },

  // Download file directly from Azure URL
  downloadFromAzureUrl: async (fileUrl, filename) => {
    try {
      const response = await fetch(fileUrl, { mode: 'cors' });
      
      if (!response.ok) throw new Error('Direct download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      window.open(fileUrl, '_blank');
      return { success: true, message: 'File opened in new tab' };
    }
  },

  // Get course assignments
  getCourseAssignments: async (courseId) => {
    return studentCourseApiHelpers.call(`/student-courses/${courseId}/assignments`);
  },

  // Get assignment details
  getAssignmentDetails: async (assignmentId) => {
    return studentCourseApiHelpers.call(`/student-courses/assignments/${assignmentId}`);
  },

  // Submit assignment with files
  submitAssignment: async (assignmentId, submissionData, files = []) => {
    const token = studentCourseApiHelpers.getToken();
    
    const formData = new FormData();
    
    if (submissionData.submissionText && submissionData.submissionText.trim()) {
      formData.append('submissionText', submissionData.submissionText.trim());
    }
    
    files.forEach((fileObj) => {
      const file = fileObj.file || fileObj;
      formData.append('files', file);
    });

    const response = await fetch(`/api/student-courses/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Assignment submission failed');
    }

    return await response.json();
  },

  // Submit assignment with progress tracking
  submitAssignmentWithProgress: async (assignmentId, submissionData, files = [], onProgress) => {
    return new Promise((resolve, reject) => {
      const token = studentCourseApiHelpers.getToken();
      
      const formData = new FormData();
      
      if (submissionData.submissionText && submissionData.submissionText.trim()) {
        formData.append('submissionText', submissionData.submissionText.trim());
      }
      
      files.forEach((fileObj) => {
        const file = fileObj.file || fileObj;
        formData.append('files', file);
      });

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          if (onProgress) onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Submission failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Submission failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during submission')));
      xhr.addEventListener('timeout', () => reject(new Error('Submission request timed out')));

      xhr.open('POST', `/api/student-courses/assignments/${assignmentId}/submit`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.timeout = 600000; // 10 minutes
      xhr.send(formData);
    });
  },

  // Get student submissions
  getStudentSubmissions: async (courseId) => {
    return studentCourseApiHelpers.call(`/student-courses/${courseId}/submissions`);
  },

  // Get all upcoming assignments across all enrolled courses - NEW METHOD
  getUpcomingAssignments: async (limit = 10) => {
    try {
      // Get all enrolled courses first
      const enrolledCoursesResponse = await studentCourseApiHelpers.getEnrolledCourses();
      
      if (!enrolledCoursesResponse.success) {
        throw new Error('Failed to fetch enrolled courses');
      }

      const enrolledCourses = enrolledCoursesResponse.data || [];
      
      // Fetch assignments for all enrolled courses
      const assignmentPromises = enrolledCourses.map(async (course) => {
        try {
          const response = await studentCourseApiHelpers.getCourseAssignments(course.course_id);
          if (response.success) {
            return response.data.map(assignment => ({
              ...assignment,
              course_name: course.course_name || assignment.course_name,
              course_code: course.course_code || course.course_id,
              instructor: course.instructor || course.fname
            }));
          }
          return [];
        } catch (error) {
          console.error(`Failed to fetch assignments for course ${course.course_id}:`, error);
          return [];
        }
      });

      const allAssignmentsArrays = await Promise.all(assignmentPromises);
      const allAssignments = allAssignmentsArrays.flat();

      // Filter and sort upcoming assignments
      const now = new Date();
      const upcomingAssignments = allAssignments
        .filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          // Show assignments due in the next 30 days and not yet submitted
          return daysDiff >= 0 && daysDiff <= 30 && !assignment.submitted;
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, limit);

      return {
        success: true,
        data: upcomingAssignments,
        message: 'Upcoming assignments retrieved successfully'
      };

    } catch (error) {
      console.error('Failed to fetch upcoming assignments:', error);
      throw error;
    }
  },

  // Download submission file
  downloadSubmissionFile: async (fileUrl, filename) => {
    return studentCourseApiHelpers.downloadFromAzureUrl(fileUrl, filename);
  },

  // Enhanced error handler
  handleError: (error) => {
    console.error('Student Course API Error:', error);
    
    const errorMessage = error.message || error.toString();
    
    // Authentication errors
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token') ||
        errorMessage.includes('Authentication failed')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return 'Session expired. Please log in again.';
    }
    
    // Authorization errors
    if (errorMessage.includes('403') || 
        errorMessage.includes('Forbidden') ||
        errorMessage.includes('not enrolled')) {
      return 'You do not have permission to access this course or resource.';
    }
    
    // Not found errors
    if (errorMessage.includes('404') || 
        errorMessage.includes('not found') ||
        errorMessage.includes('Course not found')) {
      return 'The requested course, assignment, or resource was not found.';
    }
    
    // File size errors
    if (errorMessage.includes('413') || 
        errorMessage.includes('too large') ||
        errorMessage.includes('exceeds maximum size')) {
      return 'One or more files exceed the maximum allowed size. Please choose smaller files.';
    }
    
    // File type errors
    if (errorMessage.includes('415') || 
        errorMessage.includes('not allowed') ||
        errorMessage.includes('file type')) {
      return 'One or more files have unsupported file types. Please check the allowed file types.';
    }
    
    // Server errors
    if (errorMessage.includes('500') || 
        errorMessage.includes('Internal Server Error')) {
      return 'Server error occurred. Please try again later.';
    }
    
    // Return cleaned error message
    const cleanMessage = errorMessage.replace('Error: ', '').trim();
    return cleanMessage || 'An unexpected error occurred. Please try again.';
  }
};

export default studentCourseApiHelpers;
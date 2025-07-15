// utils/apiHelpers.js - Updated for Vite Proxy with all required methods
export const apiHelpers = {
  // No need for baseURL with Vite proxy - requests go to same origin
  // Vite proxy automatically routes /api/* to localhost:3000/api/*
  
  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Generic API call - Using Vite proxy
  call: async (endpoint, options = {}) => {
    const token = apiHelpers.getToken();
    
    // No baseURL needed - Vite proxy handles /api routing
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  // Upload files - Using Vite proxy
  uploadFiles: async (files, courseId, type = 'documents') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('courseId', courseId);
    formData.append('type', type);

    const token = apiHelpers.getToken();
    
    // Vite proxy routes /api/files/upload → localhost:3000/api/files/upload
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Don't set Content-Type for FormData - let browser handle it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  },

  // Upload single file with progress tracking
  uploadFileWithProgress: async (file, courseId, type = 'documents', onProgress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('courseId', courseId);
      formData.append('type', type);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress?.(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      // Vite proxy routes to localhost:3000
      xhr.open('POST', '/api/files/upload');
      
      // Add authorization header
      const token = apiHelpers.getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      }

      // Set timeout (optional)
      xhr.timeout = 30000; // 30 seconds

      xhr.send(formData);
    });
  },

  // COURSE METHODS
  // Get courses (specific helper)
  getCourses: async () => {
    return apiHelpers.call('/courses');
  },

  // MATERIAL METHODS (matching your existing backend)
  // Create material (works for both materials and assignments)
  createMaterial: async (materialData) => {
    return apiHelpers.call('/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  },

  // Get materials with filtering - uses your existing getCourseMaterials endpoint
  getMaterials: async (filters = {}) => {
    if (filters.courseId) {
      // Use your existing course materials endpoint
      const response = await apiHelpers.call(`/materials/course/${filters.courseId}`);
      
      // Filter by material type if needed (since your backend returns both materials and assignments)
      if (filters.type === 'material' && response.success) {
        // Filter out assignments, keep only non-assignment materials
        response.data = response.data.filter(item => !item.is_assignment);
      }
      
      return response;
    } else {
      // If no courseId, we need to get materials for all teacher's courses
      // This would require a new endpoint or getting all courses first
      const currentUser = apiHelpers.getCurrentUser();
      if (currentUser?.id) {
        // For now, return empty - you might want to implement a teacher materials endpoint
        return {
          success: true,
          data: [],
          message: 'Please select a course to view materials'
        };
      }
      throw new Error('No course selected');
    }
  },

  // Get assignments with filtering - uses your existing getCourseMaterials endpoint  
  getAssignments: async (filters = {}) => {
    if (filters.courseId) {
      // Use your existing course materials endpoint
      const response = await apiHelpers.call(`/materials/course/${filters.courseId}`);
      
      if (response.success) {
        // Filter to only return assignments and transform data structure
        const assignments = response.data
          .filter(item => item.is_assignment)
          .map(item => ({
            ...item,
            // Map your database fields to expected structure
            assignmentSettings: {
              dueDate: item.due_date ? item.due_date.split('T')[0] : '',
              dueTime: item.due_date ? item.due_date.split('T')[1]?.slice(0, 5) : '',
              maxPoints: item.max_points || 100,
              allowedFileTypes: item.allowed_file_types ? JSON.parse(item.allowed_file_types) : [],
              maxFileSize: item.max_file_size_mb || 10,
              maxFiles: item.max_files || 1,
              instructions: item.instructions || '',
              allowLateSubmission: item.allow_late_submission || false,
              latePenalty: item.late_penalty_percent || 0,
            }
          }));
        
        return {
          ...response,
          data: assignments
        };
      }
      
      return response;
    } else {
      // Return empty for now if no course selected
      return {
        success: true,
        data: [],
        message: 'Please select a course to view assignments'
      };
    }
  },

  // Get course materials (your existing endpoint)
  getCourseMaterials: async (courseId) => {
    return apiHelpers.call(`/materials/course/${courseId}`);
  },

  // Get single material by ID (your existing endpoint)
  getMaterial: async (materialId) => {
    const response = await apiHelpers.call(`/materials/${materialId}`);
    
    // Transform assignment data if it's an assignment
    if (response.success && response.data.is_assignment) {
      response.data.assignmentSettings = {
        dueDate: response.data.due_date ? response.data.due_date.split('T')[0] : '',
        dueTime: response.data.due_date ? response.data.due_date.split('T')[1]?.slice(0, 5) : '',
        maxPoints: response.data.max_points || 100,
        allowedFileTypes: response.data.allowed_file_types || [],
        maxFileSize: response.data.max_file_size_mb || 10,
        maxFiles: response.data.max_files || 1,
        instructions: response.data.instructions || '',
        allowLateSubmission: response.data.allow_late_submission || false,
        latePenalty: response.data.late_penalty_percent || 0,
      };
    }
    
    return response;
  },

  // Update material (your existing endpoint)
  updateMaterial: async (materialId, materialData) => {
    return apiHelpers.call(`/materials/${materialId}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  },

  // Delete material (your existing endpoint)
  deleteMaterial: async (materialId) => {
    return apiHelpers.call(`/materials/${materialId}`, {
      method: 'DELETE',
    });
  },

  // ASSIGNMENT METHODS (using your material endpoints since assignments are materials)
  // Create assignment (same as create material)
  createAssignment: async (assignmentData) => {
    return apiHelpers.createMaterial(assignmentData);
  },

  // Get course assignments (filtered from course materials)
  getCourseAssignments: async (courseId) => {
    return apiHelpers.getAssignments({ courseId });
  },

  // Get single assignment by ID (same as get material)
  getAssignment: async (assignmentId) => {
    return apiHelpers.getMaterial(assignmentId);
  },

  // Update assignment (same as update material)
  updateAssignment: async (assignmentId, assignmentData) => {
    return apiHelpers.updateMaterial(assignmentId, assignmentData);
  },

  // Delete assignment (same as delete material)  
  deleteAssignment: async (assignmentId) => {
    return apiHelpers.deleteMaterial(assignmentId);
  },

  // Toggle material publish status (your existing endpoint)
  toggleMaterialStatus: async (materialId) => {
    return apiHelpers.call(`/materials/${materialId}/toggle`, {
      method: 'PUT',
    });
  },

  // Get material stats (your existing endpoint)
  getMaterialStats: async (courseId) => {
    return apiHelpers.call(`/materials/course/${courseId}/stats`);
  },

  // ASSIGNMENT SUBMISSION METHODS
  // Get assignment submissions
  getAssignmentSubmissions: async (assignmentId) => {
    return apiHelpers.call(`/assignments/${assignmentId}/submissions`);
  },

  // Submit assignment (for students)
  submitAssignment: async (assignmentId, submissionData) => {
    return apiHelpers.call(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  // Grade assignment submission
  gradeSubmission: async (submissionId, gradeData) => {
    return apiHelpers.call(`/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  },

  // FILE MANAGEMENT METHODS
  // Get files for a course
  getCourseFiles: async (courseId, type = null) => {
    const endpoint = type ? `/files/course/${courseId}?type=${type}` : `/files/course/${courseId}`;
    return apiHelpers.call(endpoint);
  },

  // Delete file
  deleteFile: async (fileId) => {
    return apiHelpers.call(`/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  // Get file download URL
  getFileDownloadUrl: async (fileId) => {
    return apiHelpers.call(`/files/${fileId}/download`);
  },

  // DRAFT METHODS
  // Save draft (can be used for both materials and assignments)
  saveDraft: async (draftData) => {
    return apiHelpers.call('/drafts', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  },

  // Get drafts
  getDrafts: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
    if (filters.courseId) queryParams.append('courseId', filters.courseId);
    if (filters.type) queryParams.append('type', filters.type);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/drafts?${queryString}` : '/drafts';
    
    return apiHelpers.call(endpoint);
  },

  // Delete draft
  deleteDraft: async (draftId) => {
    return apiHelpers.call(`/drafts/${draftId}`, {
      method: 'DELETE',
    });
  },

  // ANALYTICS METHODS (optional for future use)
  // Get course analytics
  getCourseAnalytics: async (courseId) => {
    return apiHelpers.call(`/analytics/course/${courseId}`);
  },

  // Get assignment analytics
  getAssignmentAnalytics: async (assignmentId) => {
    return apiHelpers.call(`/analytics/assignment/${assignmentId}`);
  },

  // UTILITY METHODS
  // Health check
  healthCheck: async () => {
    return apiHelpers.call('/health');
  },

  // Search materials and assignments
  search: async (query, filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.courseId) queryParams.append('courseId', filters.courseId);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
    
    return apiHelpers.call(`/search?${queryParams.toString()}`);
  },

  // Bulk operations
  bulkDeleteMaterials: async (materialIds) => {
    return apiHelpers.call('/materials/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: materialIds }),
    });
  },

  bulkDeleteAssignments: async (assignmentIds) => {
    return apiHelpers.call('/assignments/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: assignmentIds }),
    });
  },

  // Error handler helper
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Invalid token')) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return 'Please log in to continue';
    }
    
    if (error.message.includes('403')) {
      return 'You do not have permission to perform this action';
    }
    
    if (error.message.includes('404')) {
      return 'The requested resource was not found';
    }
    
    if (error.message.includes('429')) {
      return 'Too many requests. Please try again later';
    }
    
    if (error.message.includes('413')) {
      return 'File size too large. Please choose a smaller file';
    }
    
    if (error.message.includes('415')) {
      return 'File type not supported';
    }
    
    if (error.message.includes('500')) {
      return 'Server error. Please try again later';
    }
    
    return error.message || 'An unexpected error occurred';
  }
};

// Usage Examples:

// Basic API calls
// const courses = await apiHelpers.getCourses();
// const materials = await apiHelpers.getCourseMaterials('math-101');

// Get materials with filters
// const teacherMaterials = await apiHelpers.getMaterials({ 
//   teacherId: 'teacher123', 
//   courseId: 'math-101',
//   type: 'material' 
// });

// Get assignments with filters
// const courseAssignments = await apiHelpers.getAssignments({ 
//   teacherId: 'teacher123', 
//   courseId: 'math-101' 
// });

// File uploads
// const result = await apiHelpers.uploadFiles([file], 'math-101', 'images');

// File upload with progress
// await apiHelpers.uploadFileWithProgress(file, 'math-101', 'documents', (progress) => {
//   console.log(`Upload progress: ${progress}%`);
// });

// Create and update operations
// const newMaterial = await apiHelpers.createMaterial(materialData);
// const updatedMaterial = await apiHelpers.updateMaterial('material123', updatedData);
// const newAssignment = await apiHelpers.createAssignment(assignmentData);
// const updatedAssignment = await apiHelpers.updateAssignment('assignment123', updatedData);

// Delete operations
// await apiHelpers.deleteMaterial('material123');
// await apiHelpers.deleteAssignment('assignment123');

// Search
// const searchResults = await apiHelpers.search('algebra', { courseId: 'math-101' });

// Error handling
// try {
//   const result = await apiHelpers.createMaterial(data);
// } catch (error) {
//   const userMessage = apiHelpers.handleError(error);
//   alert(userMessage);
// }

export default apiHelpers;
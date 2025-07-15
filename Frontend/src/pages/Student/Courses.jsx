import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext"
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

const CourseSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(""); // New state for grade filter
  const [courseDetails, setCourseDetails] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // Toast state
  const { user } = useAuth() // Get user data from context

  // Available grades for filter dropdown (based on actual data)
  const availableGrades = [5, 6, 7, 9, 10, 11, 12];

  // Toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000); // Auto hide after 4 seconds
  };

  // Function to handle opening the modal
  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
    
    // Reset enrollment status when opening a new modal
    setEnrollmentStatus(null);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/course_view/getCourseView', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        });
        const data = await res.json();

        if (data.success === false) {
          setCourseDetails([]);
          setFilteredCourses([]);
        } else {
          setCourseDetails(data);
          setFilteredCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, []);

  // Updated useEffect to handle both search and grade filtering
  useEffect(() => {
    let filtered = courseDetails;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by grade
    if (selectedGrade) {
      filtered = filtered.filter((course) =>
        course.grade === parseInt(selectedGrade)
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedGrade, courseDetails]);

  // Function to handle course enrollment
  const handleEnrollCourse = async () => {
    if (!selectedCourse) return;
    
    // Get student ID from user context or local storage
    let userId = user?.id;
    const studentId = userId || localStorage.getItem("student_id");
    
    // Get course ID - try different possible field names
    const courseId = selectedCourse.course_id || selectedCourse.id || selectedCourse.courseId;
    
    // Debug logging
    console.log("Debug Info:");
    console.log("User object:", user);
    console.log("Student ID:", studentId);
    console.log("Selected Course:", selectedCourse);
    console.log("Course ID:", courseId);
    
    if (!studentId) {
      setEnrollmentStatus({
        success: false,
        message: "Please login first to enroll in this course."
      });
      showToast("Please login first to enroll in this course.", 'error');
      return;
    }

    if (!courseId) {
      setEnrollmentStatus({
        success: false,
        message: "Course ID not found. Please try again."
      });
      showToast("Course ID not found. Please try again.", 'error');
      return;
    }

    setEnrollLoading(true);
    
    try {
      const requestBody = {
        student_id: studentId,
        course_id: courseId
      };
      
      console.log("Request body:", requestBody);
      
      const response = await fetch('/api/course_view/enrollCourseRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok && data.success) {
        setEnrollmentStatus({
          success: true,
          message: data.message || "Enrollment request sent successfully!"
        });
        showToast(data.message || "Enrollment request sent successfully! Check your email for confirmation.", 'success');
      } else {
        setEnrollmentStatus({
          success: false,
          message: data.message || "Failed to enroll. Please try again later."
        });
        showToast(data.message || "Failed to enroll. Please try again later.", 'error');
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      const errorMessage = "An error occurred. Please try again later.";
      setEnrollmentStatus({
        success: false,
        message: errorMessage
      });
      showToast(errorMessage, 'error');
    } finally {
      setEnrollLoading(false);
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "Advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get grade badge style
  const getGradeStyle = (grade) => {
    const gradeNumber = parseInt(grade);
    if (gradeNumber <= 6) {
      return "bg-yellow-100 text-yellow-800";
    } else if (gradeNumber <= 9) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  // Function to get background gradient for course card
  const getCardGradient = (index) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-orange-400 to-orange-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg shadow-md">
            <div className="flex items-center mb-4">
              <svg className="h-10 w-10 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-2xl font-bold text-red-700">Error Loading Courses</h2>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Header />
      <Sidebar />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => setToast(null)}
                className={`inline-flex ${
                  toast.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
                } focus:outline-none`}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 sm:ml-64 pt-20 w-full">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section with Search and Filter */}
          <div className="w-full">
            <div className="py-10 text-center">
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                Discover Courses
              </h2>
              <div className="flex justify-center items-center space-x-4 max-w-2xl mx-auto">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Courses"
                    className="w-full pl-10 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 outline-none"
                    value={searchTerm}
                    id="search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Grade Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 outline-none bg-white min-w-[140px]"
                  >
                    <option value="">All Grades</option>
                    {availableGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Courses Grid - Explicitly set to 3 cards per row */}
          <div className="w-full pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transform hover:shadow-xl transition-all duration-300"
                  >
                    {/* Replaced image with gradient background */}
                    <div className={`relative overflow-hidden group h-48 ${getCardGradient(index)}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <h4 className="font-semibold text-lg opacity-90">{course.course_name}</h4>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <span className="text-white font-semibold block">View Course Details</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-3">{course.course_name}</h3>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{course.fname} {course.lname}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getLevelStyle(course.course_type)}`}>
                            {course.course_type}
                          </span>
                          {/* Grade badge */}
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getGradeStyle(course.grade)}`}>
                            Grade {course.grade}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => openCourseModal(course)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-center text-gray-500 text-xl">No courses found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your search criteria or grade filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Updated Modal with new fields */}
      {modalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-400 to-sky-500 text-white p-6 relative">
              <h1 className="text-2xl font-bold">{selectedCourse.course_name}</h1>
              <p className="text-blue-100 mt-1">Course Details</p>
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-blue-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-5">
                    <label className="text-sm text-gray-500 block mb-1">Instructor</label>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                        </svg>
                      </div>
                      <p className="text-lg font-medium">{selectedCourse.fname} {selectedCourse.lname}</p>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="text-sm text-gray-500 block mb-1">Grade</label>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${getGradeStyle(selectedCourse.grade)}`}>
                      Grade {selectedCourse.grade}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="mb-5">
                    <label className="text-sm text-gray-500 block mb-1">Fees</label>
                    <p className="text-lg font-medium">
                      Rs. {selectedCourse.Fees?.toLocaleString() || '2,500'}
                    </p>
                  </div>
                  
                  <div className="mb-5">
                    <label className="text-sm text-gray-500 block mb-1">Course Type</label>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${getLevelStyle(selectedCourse.course_type)}`}>
                      {selectedCourse.course_type}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enrollment Status Message */}
              {enrollmentStatus && (
                <div className={`p-4 mb-4 rounded-lg ${enrollmentStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {enrollmentStatus.success ? (
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{enrollmentStatus.message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={handleEnrollCourse}
                  disabled={enrollLoading || (enrollmentStatus && enrollmentStatus.success)}
                  className={`bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center ${
                    enrollLoading || (enrollmentStatus && enrollmentStatus.success) 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:shadow-lg'
                  }`}
                >
                  {enrollLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : enrollmentStatus && enrollmentStatus.success ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      Requested
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Enroll Now
                    </>
                  )}
                </button>
                <button 
                  onClick={closeModal} 
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSection;
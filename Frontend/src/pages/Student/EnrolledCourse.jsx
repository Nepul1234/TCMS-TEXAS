import { useState, useEffect } from "react"
import { Book, Clock, Calendar, User, AlertCircle, BookOpen} from "lucide-react"
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import { useAuth } from "../../components/context/AuthContext"
import CourseSection from "./CourseSection"


export default function EnrolledCourse() {
  const [courses, setCourses] = useState([]) // State to hold the courses
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState(null) // Error state
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null); // State to track selected course
  const [showCourseSection, setShowCourseSection] = useState(false); // State to control CourseSection visibility
  
  const [emailData, setEmailData] = useState({
    to_name: '',
    from_name: '',
    //message: 'User' + {user.name} + 'has requested to enroll in a course ',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs.send('your_service_id', 'your_template_id', emailData, 'your_user_id')
      .then(response => {
        console.log('Email sent successfully', response);
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });
  };

  // Handler for the "Go to Course" button
  const handleGoToCourse = (course) => {
    console.log('Selected course object:', course);
  console.log('Available course ID fields:', {
    course_id: course.course_id,
    _id: course._id,
    id: course.id,
    courseId: course.courseId
  });
    setSelectedCourse(course);
    setShowCourseSection(true);
  };

  // Handler to go back to the courses list
  const handleBackToCourses = () => {
    setShowCourseSection(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    const retrieveEnrolledCourses = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(atob(token.split('.')[1]));
      const id = userData.id;

      try {
        setLoading(true)
        // API call to fetch courses
        const response = await fetch("/api/get_course_enrollment/getCourseEnrollmentByID", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache", // Disable caching
          },
          body: JSON.stringify({ student_id: id }),
        })

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }

        const result = await response.json()
        console.log("API Response:", result) // Log the API response for debugging

        // If response is successful, set the courses, else set an empty array
        if (result.courseDetails && result.courseDetails.length > 0) {
          setCourses(result.courseDetails) // Set courses data
          console.log(result.courseDetails)
        } else {
          setCourses([]) 
        }
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("Failed to load your enrolled courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    retrieveEnrolledCourses()
  }, [user])

  if (loading) {
    return (
      <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-blue-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium text-lg">Loading your courses...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-700">Error Loading Courses</h2>
            </div>
            <p className="text-gray-700 mb-6 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <Header />
      <Sidebar />
      
      <div className="p-6 sm:ml-64 pt-20 w-full">
        <div className="container mx-auto">
          {showCourseSection && selectedCourse ? (
            <div>
              {/* Enhanced Back button */}
              <button
                onClick={handleBackToCourses}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg border border-blue-100 transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to My Courses
              </button>
              
              {/* Render the CourseSection component with the selected course */}
              <CourseSection courseId={selectedCourse.course_id || selectedCourse._id} course={selectedCourse} />
            </div>
          ) : (
            <>
              {/* Enhanced Header Section */}
              <div className="mb-10">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
                  <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Book className="h-8 w-8 text-blue-600" />
                    </div>
                    My Enrolled Courses
                  </h1>
                  <p className="text-blue-700 ml-14 text-base">Your enrolled courses</p>
                  
                  {courses.length > 0 && (
                    <div className="mt-4 ml-14 flex items-center space-x-6 text-sm text-blue-600">
                      <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span className="font-medium">{courses.length} Course{courses.length > 1 ? 's' : ''} Enrolled</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => (
                    <div
                      key={course.course_id || course._id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {/* Course Image*/}
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 relative overflow-hidden">
                        {course.image_url ? (
                          <img
                            src={course.image_url || "/placeholder.svg"}
                            alt={course.course_name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Book className="w-24 h-24 text-white opacity-60" />
                          </div>
                        )}
                        {/* Enhanced Status Badge */}
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Enrolled
                        </div>
                        {/* Course ID Badge */}
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {course.course_id}
                        </div>
                        {/* Decorative overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-3 line-clamp-2 leading-tight">{course.course_name}</h3>
                        <p className="text-blue-700 mb-5 line-clamp-3 text-sm leading-relaxed">
                          {course.description || "No description available for this course."}
                        </p>

                        {/* Course Details with enhanced styling */}
                        <div className="space-y-3 text-sm text-blue-600 mb-6">
                          {course.instructor && (
                            <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                              <User className="w-4 h-4 mr-3 text-blue-500" />
                              <span className="font-medium">{course.instructor}</span>
                            </div>
                          )}

                          {course.start_time && course.end_time && (
                            <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                              <Clock className="w-4 h-4 mr-3 text-blue-500" />
                              <span className="font-medium">{`${course.start_time} - ${course.end_time}`}</span>
                            </div>
                          )}

                          {course.weekday && (
                            <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                              <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                              <span className="font-medium">{course.weekday}</span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Action Button */}
                        <button
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={() => handleGoToCourse(course)}
                        >
                          Go to Course
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none" 
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
                    <Book className="w-16 h-16 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-blue-900 mb-4">No Courses Enrolled</h2>
                  <p className="text-blue-700 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    You haven't enrolled in any courses yet. Browse our catalog to find courses that match your interests.
                  </p>
                  <a
                    href="/courses"
                    className="inline-flex items-center py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Browse Courses
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
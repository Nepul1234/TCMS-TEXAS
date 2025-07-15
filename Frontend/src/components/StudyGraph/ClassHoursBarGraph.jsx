import { useState, useEffect } from "react"

export default function ClassHoursBarGraph({ studentId }) {
  const [timeRange, setTimeRange] = useState("week")
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fallback sample data
  const sampleData = [
    {
      course_id: "C005",
      course_name: "Maths",
      grade: 10,
      description: "Basic math concepts",
      start_time: "8am",
      end_time: "10am",
      t_id: "T001",
      weekday: "friday",
      course_type: "theory",
      Fees: 800,
      hall_allocation: "2"
    },
    {
      course_id: "C006",
      course_name: "History",
      grade: 10,
      description: "Introduction to history",
      start_time: "3pm",
      end_time: "5pm",
      t_id: "T002",
      weekday: "wednesday",
      course_type: "theory",
      Fees: 500,
      hall_allocation: "4"
    },
    {
      course_id: "C007",
      course_name: "Arts",
      grade: 12,
      description: "Drawing and creativity",
      start_time: "1pm",
      end_time: "3pm",
      t_id: "T003",
      weekday: "thursday",
      course_type: "theory",
      Fees: 800,
      hall_allocation: "5"
    }
  ];

  // Fetch enrolled courses from backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from multiple possible sources
        let currentStudentId = studentId;
        
        // If not passed as prop, try to get from localStorage user data
        if (!currentStudentId) {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          currentStudentId = storedUser?.id || storedUser?.student_id || storedUser?.userId;
        }
        
        // Get token from localStorage (same as your auth context)
        const token = localStorage.getItem('token');
        console.log('Fetching courses for student ID:', currentStudentId);
        console.log('Token available:', token ? 'Yes' : 'No');
        
        if (!token) {
          console.warn('No authentication token found, using sample data');
          setEnrolledCourses(sampleData);
          setLoading(false);
          return;
        }

        if (!currentStudentId) {
          console.warn('No student ID found, using sample data');
          setEnrolledCourses(sampleData);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/get_course_enrollment/getCourseEnrollmentByID', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            student_id: currentStudentId
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle the response format from your enrollment API
        if (data && data.courseDetails && Array.isArray(data.courseDetails)) {
          setEnrolledCourses(data.courseDetails);
          console.log('Fetched course details:', data.courseDetails);
        } else if (Array.isArray(data)) {
          setEnrolledCourses(data);
          console.log('Fetched courses array:', data);
        } else {
          console.warn('Unexpected response format:', data);
          console.warn('Using sample data as fallback');
          setEnrolledCourses(sampleData);
        }

      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err.message);
        // Use sample data as fallback
        setEnrolledCourses(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [studentId]);

  // Helper function to convert time string to 24-hour format
  const convertTo24Hour = (timeStr) => {
    const time = timeStr.toLowerCase();
    let [hours, period] = time.includes('am') ? [time.replace('am', ''), 'am'] : [time.replace('pm', ''), 'pm'];
    hours = parseInt(hours);
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours;
  };

  // Calculate duration for each course
  const calculateCourseDuration = (course) => {
    const startHour = convertTo24Hour(course.start_time);
    const endHour = convertTo24Hour(course.end_time);
    return endHour - startHour;
  };

  // Prepare data based on your enrolled courses
  const prepareData = () => {
    const totalWeeklyHours = enrolledCourses.reduce((total, course) => 
      total + calculateCourseDuration(course), 0
    );

    const data = {
      week: [
        { day: "Mon", hours: 0, target: 2 },
        { day: "Tue", hours: 0, target: 2 },
        { day: "Wed", hours: 0, target: 2 },
        { day: "Thu", hours: 0, target: 2 },
        { day: "Fri", hours: 0, target: 2 },
        { day: "Sat", hours: 0, target: 2 },
        { day: "Sun", hours: 0, target: 2 },
      ],
      month: [
        { day: "Week 1", hours: totalWeeklyHours, target: totalWeeklyHours },
        { day: "Week 2", hours: totalWeeklyHours, target: totalWeeklyHours },
        { day: "Week 3", hours: totalWeeklyHours, target: totalWeeklyHours },
        { day: "Week 4", hours: totalWeeklyHours, target: totalWeeklyHours },
      ],
    };

    // Map actual course hours to weekly data
    enrolledCourses.forEach(course => {
      const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        .indexOf(course.weekday.toLowerCase());
      
      if (dayIndex !== -1) {
        data.week[dayIndex].hours += calculateCourseDuration(course);
      }
    });

    return data;
  };

  const data = prepareData();

  // Calculate total hours and average
  const currentData = data[timeRange]
  const totalHours = currentData.reduce((sum, item) => sum + item.hours, 0)
  const averageHours = (totalHours / currentData.length).toFixed(1)
  const targetTotal = currentData.reduce((sum, item) => sum + item.target, 0)
  const percentOfTarget = Math.round((totalHours / targetTotal) * 100)

  // Find max value for scaling
  const maxValue = Math.max(...currentData.map((item) => Math.max(item.hours, item.target)), 1) * 1.2

  // Show loading state
  if (loading) {
    return (
      <div className="class-hours-graph">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading class schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state (but still render with sample data)
  const ErrorBanner = () => (
    error && (
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm text-yellow-800">
              Could not load live data ({error}). Showing sample schedule.
            </p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="class-hours-graph">
      <ErrorBanner />
      {/* Graph header with stats */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-6">
          <div className="stat">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold text-gray-800">{totalHours}</p>
          </div>
          <div className="stat">
            <p className="text-sm text-gray-500">Daily Average</p>
            <p className="text-2xl font-bold text-gray-800">{averageHours}</p>
          </div>
          <div className="stat">
            <p className="text-sm text-gray-500">Courses</p>
            <p className="text-2xl font-bold text-gray-800">{enrolledCourses.length}</p>
          </div>
        </div>

        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === "week" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === "month" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Graph grid */}
        <div className="ml-10 h-64 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((_, index) => (
            <div key={index} className="w-full h-px bg-gray-200" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute left-10 right-0 top-0 bottom-16 flex items-end">
          <div className="w-full h-full flex justify-between items-end">
            {currentData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full group">
                {/* Target line - only show if different from actual hours */}
                {item.target !== item.hours && (
                  <div
                    className="absolute w-full border-t-2 border-dashed border-gray-300 z-0"
                    style={{
                      bottom: `${(item.target / maxValue) * 100}%`,
                      left: 0,
                      right: 0,
                    }}
                  />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10">
                  <p>Class Hours: {item.hours} hrs</p>
                  {timeRange === 'week' && item.hours > 0 && (
                    <p>
                      {enrolledCourses
                        .filter(course => {
                          const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                            .indexOf(course.weekday.toLowerCase());
                          return dayIndex === index;
                        })
                        .map(course => course.course_name)
                        .join(', ')
                      }
                    </p>
                  )}
                </div>

                {/* Bar */}
                <div
                  className={`w-8 rounded-t-md ${
                    item.hours > 0 ? "bg-blue-500" : "bg-gray-300"
                  } group-hover:opacity-80 transition-all duration-200`}
                  style={{ height: `${Math.max((item.hours / maxValue) * 100, 2)}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-10 mt-2 flex justify-between">
          {currentData.map((item, index) => (
            <div key={index} className="text-xs text-gray-500 text-center w-8">
              {item.day}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-xs text-gray-600">Class Hours</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded-sm mr-2"></div>
          <span className="text-xs text-gray-600">Free Time</span>
        </div>
        {timeRange === 'week' && (
          <div className="flex items-center">
            <div className="w-4 border-t-2 border-dashed border-gray-300 mr-2"></div>
            <span className="text-xs text-gray-600">Target Hours</span>
          </div>
        )}
      </div>

      {/* Course Schedule Summary */}
      {timeRange === 'week' && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly Schedule</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {enrolledCourses.map((course, index) => (
              <div key={index} className="bg-white rounded p-2 border">
                <div className="font-medium text-gray-800">{course.course_name}</div>
                <div className="text-gray-600 capitalize">
                  {course.weekday}s • {course.start_time}-{course.end_time}
                </div>
                <div className="text-gray-500">Grade {course.grade}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, BookOpen, Filter, Search, Layout, List } from "lucide-react";
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

const StudentSchedules = () => {
  // State for schedules data
  const [schedules, setSchedules] = useState([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for error handling
  const [error, setError] = useState(null);
  // State for view type (calendar or list)
  const [viewType, setViewType] = useState("calendar");
  // State for filter options
  const [filters, setFilters] = useState({
    searchTerm: "",
    dayFilter: "all"
  });

  // Student ID - extracted from JWT token
  const [studentId, setStudentId] = useState(null);
  // State for enrolled course count from API
  const [enrolledCourseCount, setEnrolledCourseCount] = useState(0);
  // State for other metrics that could come from API
  const [onlineSessionsCount, setOnlineSessionsCount] = useState(0);
  const [physicalSessionsCount, setPhysicalSessionsCount] = useState(0);
  const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);

  // Days of the week for calendar view - Now includes weekends!
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Time slots for calendar view (from 8am to 8pm)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:00 ${period}`;
  });

  // Extract student ID from JWT token
  useEffect(() => {
    const getStudentIdFromToken = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(atob(token.split('.')[1]));
        const id = userData.id;
        
        if (id) {
          setStudentId(id);
        } else {
          setError("Student ID not found in token. Please log in again.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error extracting student ID from token:', err);
        setError("Invalid authentication token. Please log in again.");
        setIsLoading(false);
      }
    };

    getStudentIdFromToken();
  }, []);

  // Fetch schedules data from your API
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!studentId) return; // Don't fetch if no student ID
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Using your actual API endpoint
        const response = await fetch(`http://localhost:3000/api/schedules/${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Transform the API data to match your frontend format
          const transformedSchedules = result.data.map(schedule => ({
            id: schedule.id,
            courseCode: schedule.courseCode,
            courseName: schedule.courseName,
            instructor: schedule.instructor,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            type: schedule.type,
            color: schedule.color || "blue", // Default to blue if no color
            mode: schedule.mode
          }));
          
          setSchedules(transformedSchedules);
          
          // Calculate metrics from the fetched schedule data
          const onlineSessions = transformedSchedules.filter(s => s.mode === "Online").length;
          const physicalSessions = transformedSchedules.filter(s => s.mode === "Physical").length;
          const weeklyHours = transformedSchedules.reduce((total, schedule) => {
            const startHour = timeToHours(schedule.startTime);
            const endHour = timeToHours(schedule.endTime);
            return total + (endHour - startHour);
          }, 0);
          
          // Update state with calculated values
          setOnlineSessionsCount(onlineSessions);
          setPhysicalSessionsCount(physicalSessions);
          setTotalWeeklyHours(weeklyHours);
        } else {
          throw new Error(result.message || 'Failed to fetch schedules');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError(`Failed to fetch schedule data: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, [studentId]); // Now depends on studentId

  // Fetch enrolled course count from API
  useEffect(() => {
    const fetchEnrolledCourseCount = async () => {
      if (!studentId) return; // Don't fetch if no student ID
      
      try {
        const response = await fetch('http://localhost:3000/api/get_course_enrollment/getStudentEnrolledCourseCount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: studentId
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setEnrolledCourseCount(result.enrolled_course_count);
        } else {
          console.error('Failed to fetch enrolled course count:', result.message);
          // Keep the fallback calculation if API fails
          setEnrolledCourseCount([...new Set(schedules.map(s => s.courseCode))].length);
        }
        
      } catch (err) {
        console.error('Error fetching enrolled course count:', err);
        // Keep the fallback calculation if API fails
        setEnrolledCourseCount([...new Set(schedules.map(s => s.courseCode))].length);
      }
    };
    
    fetchEnrolledCourseCount();
  }, [studentId]); // Only depends on studentId now

  // Handle student ID change (if you want to allow changing student)
  const handleStudentIdChange = (newStudentId) => {
    setStudentId(newStudentId);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Convert time string (like "09:00 AM") to hours for positioning in calendar
  const timeToHours = (timeString) => {
    if (!timeString) return 0;
    
    const [timePart, periodPart] = timeString.split(' ');
    if (!timePart || !periodPart) return 0;
    
    const [hoursStr, minutesStr] = timePart.split(':');
    if (!hoursStr || !minutesStr) return 0;
    
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (periodPart === 'PM' && hours !== 12) {
      hours += 12;
    } else if (periodPart === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours + minutes / 60;
  };

  // Filter schedules based on search term and day filter
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      !filters.searchTerm || 
      schedule.courseName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      schedule.courseCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      schedule.instructor.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesDay = filters.dayFilter === "all" || schedule.day === filters.dayFilter;
    
    return matchesSearch && matchesDay;
  });

  // Calculate schedule summary metrics
  const summaryMetrics = {
    enrolledCourses: enrolledCourseCount, // From API
    onlineSessions: onlineSessionsCount, // From database schedule data
    physicalSessions: physicalSessionsCount, // From database schedule data
    totalWeeklyHours: totalWeeklyHours // From database schedule data
  };

  // Get position and height for a schedule item in the calendar view
  const getSchedulePosition = (schedule) => {
    const startHour = timeToHours(schedule.startTime);
    const endHour = timeToHours(schedule.endTime);
    const duration = endHour - startHour;
    
    // Responsive sizing - smaller on mobile
    const cellHeight = 48; // Base height for mobile (h-12)
    const mdCellHeight = 56; // Height for md and up (h-14)
    
    const top = (startHour - 8) * cellHeight; // 8 AM is the start of our calendar
    const height = duration * cellHeight;
    const mdTop = (startHour - 8) * mdCellHeight;
    const mdHeight = duration * mdCellHeight;
    
    return { top, height, mdTop, mdHeight };
  };

  // Get color classes based on course type - Blue, White, and Lime Green only
  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-100 border-blue-500 text-blue-800",
      green: "bg-lime-100 border-lime-500 text-lime-800", 
      red: "bg-blue-100 border-blue-500 text-blue-800",
      purple: "bg-lime-100 border-lime-500 text-lime-800",
      yellow: "bg-lime-100 border-lime-500 text-lime-800",
      indigo: "bg-blue-100 border-blue-500 text-blue-800",
      orange: "bg-lime-100 border-lime-500 text-lime-800"
    };
    
    return colorMap[color] || "bg-blue-100 border-blue-500 text-blue-800";
  };

  // Check if day is weekend
  const isWeekend = (day) => day === "Saturday" || day === "Sunday";

  // Calendar View Component - Enhanced design with responsive sizing
  const CalendarView = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      <div className="bg-blue-600 p-4 md:p-6">
        <h3 className="text-white font-bold text-lg md:text-xl flex items-center gap-2 md:gap-3">
          <Calendar className="w-5 h-5 md:w-6 md:h-6" />
          Weekly Schedule Calendar
        </h3>
        <p className="text-blue-100 mt-1 text-sm md:text-base">Visual overview of your weekly classes</p>
      </div>
      <div className="p-2 md:p-4 bg-white">
        <div className="w-full">
          <div className="grid grid-cols-8 gap-1 md:gap-2">
            {/* Time column - Made narrower */}
            <div className="bg-white z-10 rounded-lg shadow-md">
              <div className="h-12 md:h-14 flex items-center justify-center font-bold text-gray-700 bg-gray-100 rounded-lg mb-2 shadow-md">
                <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs md:text-sm">Time</span>
              </div>
              {timeSlots.map((time, index) => (
                <div key={index} className="h-12 md:h-14 flex items-center justify-center text-xs text-gray-600 font-medium border-b border-gray-100 last:border-b-0">
                  <span className="hidden sm:inline">{time}</span>
                  <span className="sm:hidden">{time.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            
            {/* Days columns - More responsive */}
            {daysOfWeek.map((day, dayIndex) => (
              <div key={dayIndex} className="relative min-w-0">
                <div className={`h-12 md:h-14 flex items-center justify-center font-bold rounded-lg mb-2 shadow-md transition-all duration-300 ${
                  isWeekend(day) 
                    ? 'bg-lime-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  <span className="text-xs md:text-sm font-bold truncate px-1">
                    <span className="hidden lg:inline">{day}</span>
                    <span className="lg:hidden">{day.substring(0, 3)}</span>
                  </span>
                </div>
                <div className="h-[624px] md:h-[728px] relative bg-gray-50 rounded-lg shadow-inner">
                  {/* Time grid lines */}
                  {timeSlots.map((_, timeIndex) => (
                    <div 
                      key={timeIndex} 
                      className="absolute w-full h-12 md:h-14 border-b border-gray-200/60" 
                      style={{ 
                        top: `${timeIndex * 48}px`
                      }}
                    ></div>
                  ))}
                  
                  {/* Schedule items */}
                  {filteredSchedules
                    .filter(schedule => schedule.day === day)
                    .map((schedule) => {
                      const { top, height } = getSchedulePosition(schedule);
                      return (
                        <div
                          key={schedule.id}
                          className={`absolute w-full p-1 md:p-2 rounded-lg border-l-2 md:border-l-4 transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer shadow-md ${getColorClasses(schedule.color)}`}
                          style={{ 
                            top: `${top}px`, 
                            height: `${height}px`,
                            left: '2px',
                            right: '2px'
                          }}
                        >
                          <div className="text-xs font-bold mb-1 truncate">{schedule.courseCode}</div>
                          <div className="text-xs opacity-90 mb-1 hidden md:flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{schedule.startTime.split(' ')[0]}</span>
                          </div>
                          <div className="text-xs opacity-80 hidden lg:flex items-center gap-1">
                            <span className="truncate">{schedule.mode}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // List View Component - Enhanced design
  const ListView = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 p-4 md:p-6">
        <h3 className="text-white font-bold text-lg md:text-xl flex items-center gap-2 md:gap-3">
          <List className="w-5 h-5 md:w-6 md:h-6" />
          Detailed Schedule List
        </h3>
        <p className="text-blue-100 mt-1 text-sm md:text-base">Complete course information in tabular format</p>
      </div>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Course Details
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Schedule
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mode
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Instructor
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.map((schedule, index) => (
              <tr key={schedule.id} className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center shadow-lg ${getColorClasses(schedule.color)}`}>
                      <span className="font-bold text-sm">{schedule.courseCode.substring(0, 3)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{schedule.courseCode}</div>
                      <div className="text-sm text-gray-600 font-medium">{schedule.courseName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold shadow-md ${
                    isWeekend(schedule.day) 
                      ? 'bg-lime-100 text-lime-800 border border-lime-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {schedule.day}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{schedule.mode}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{schedule.instructor}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full shadow-md ${
                    schedule.type === 'Lecture' ? 'bg-lime-100 text-lime-800 border border-lime-200' :
                    schedule.type === 'Lab' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    schedule.type === 'Theory' ? 'bg-lime-100 text-lime-800 border border-lime-200' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {schedule.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading your schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-4 sm:ml-64 pt-20 w-full flex items-center justify-center">
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-red-200 max-w-md">
            <div className="text-red-600 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Failed to Load Schedule</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No schedules found
  if (schedules.length === 0) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-4 sm:ml-64 pt-20 w-full flex items-center justify-center">
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-200 max-w-md text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">No Schedules Found</h3>
            <p className="text-sm text-gray-600 mb-4">No class schedules found for student ID: {studentId || 'Unknown'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Refresh
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
      
      <div className="p-6 sm:ml-64 pt-20 w-full">
        <div className="container mx-auto max-w-7xl">
          {/* Page header with beautiful gradient */}
          <div className="mb-8">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                    <BookOpen className="w-10 h-10" />
                    My Class Schedule
                  </h1>
                  <p className="text-blue-100 text-lg">Your classes schedules</p>
                  <p className="text-blue-200 text-sm mt-2">Student ID: {studentId || 'Loading...'}</p>
                </div>
                
                {/* Enhanced Controls */}
                <div className="flex items-center space-x-4 mt-6 lg:mt-0">
                  {/* View toggle with beautiful design */}
                  <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl p-1 shadow-xl">
                    <button
                      onClick={() => setViewType("calendar")}
                      className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        viewType === "calendar" 
                          ? "bg-white text-blue-600 shadow-lg transform scale-105" 
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <Layout className="w-4 h-4" />
                      Calendar
                    </button>
                    <button
                      onClick={() => setViewType("list")}
                      className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        viewType === "list" 
                          ? "bg-white text-blue-600 shadow-lg transform scale-105" 
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="mb-6 md:mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-end">
              {/* Day filter */}
              <div className="relative w-full sm:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Day</label>
                <select
                  name="dayFilter"
                  value={filters.dayFilter}
                  onChange={handleFilterChange}
                  className="block w-full sm:w-40 pl-4 pr-10 py-3 text-base border-2 border-gray-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 font-medium"
                >
                  <option value="all">All Days</option>
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={day}>{day}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-11 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Search filter with icon */}
              <div className="relative flex-grow w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                    placeholder="Search courses, instructors, or course codes..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Schedule content based on view type */}
          <div className="mb-6 md:mb-8">
            {viewType === "calendar" ? <CalendarView /> : <ListView />}
          </div>
          
          {/* Enhanced Schedule summary */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-lime-600 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
                Schedule Summary & Analytics
              </h2>
              <p className="text-lime-100 mt-1 text-sm md:text-base">Overview of your academic workload</p>
            </div>
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-blue-600 p-4 md:p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">{summaryMetrics.enrolledCourses}</div>
                      <div className="text-blue-100 font-semibold text-xs md:text-sm">Enrolled Courses</div>
                    </div>
                    <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-lime-600 p-4 md:p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">{summaryMetrics.onlineSessions}</div>
                      <div className="text-lime-100 font-semibold text-xs md:text-sm">Online Sessions</div>
                    </div>
                    <User className="w-6 h-6 md:w-10 md:h-10 text-lime-200" />
                  </div>
                </div>
                
                <div className="bg-blue-600 p-4 md:p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">{summaryMetrics.physicalSessions}</div>
                      <div className="text-blue-100 font-semibold text-xs md:text-sm">Physical Sessions</div>
                    </div>
                    <Clock className="w-6 h-6 md:w-10 md:h-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-lime-600 p-4 md:p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">{Math.round(summaryMetrics.totalWeeklyHours)}</div>
                      <div className="text-lime-100 font-semibold text-xs md:text-sm">Weekly Hours</div>
                    </div>
                    <Calendar className="w-6 h-6 md:w-10 md:h-10 text-lime-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedules;
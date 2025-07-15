import React, { useState, useEffect } from 'react';
import { Search, X, User, Mail, Phone, Calendar, GraduationCap, MapPin, CreditCard, BookOpen } from 'lucide-react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";

const CourseEnrollmentTable = () => {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);

  // Fetch data from your API
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/get_course_enrollment/get_course_enrollment');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setEnrollmentData(data.enrollmentData);
        setFilteredData(data.enrollmentData);
        
        // Extract all unique courses for the dropdown
        const allCourses = new Set();
        data.enrollmentData.forEach(student => {
          const courses = student.enrolled_courses.split(', ');
          courses.forEach(course => allCourses.add(course.trim()));
        });
        setAvailableCourses([...allCourses].sort());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, []);

  // Filter data based on selected course
  useEffect(() => {
    if (selectedCourse === '') {
      setFilteredData(enrollmentData);
    } else {
      const filtered = enrollmentData.filter(student => {
        const courses = student.enrolled_courses.split(', ');
        return courses.some(course => course.trim() === selectedCourse);
      });
      setFilteredData(filtered);
    }
  }, [selectedCourse, enrollmentData]);

  // Parse enrolled courses string to count unique courses
  const getUniqueCoursesCount = (coursesString) => {
    const courses = coursesString.split(', ');
    const uniqueCourses = new Set(courses);
    return uniqueCourses.size;
  };

  // Parse enrolled courses to display cleanly
  const parseEnrolledCourses = (coursesString) => {
    const courses = coursesString.split(', ');
    const uniqueCourses = [...new Set(courses)];
    return uniqueCourses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-lg">Loading enrollment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-10 w-10 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-blue-900">Course Enrollment Dashboard</h1>
        </div>
        <p className="text-blue-600 text-lg">Student Course Enrollment Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{enrollmentData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Enrollments</p>
              <p className="text-2xl font-bold text-blue-900">
                {enrollmentData.reduce((total, student) => 
                  total + getUniqueCoursesCount(student.enrolled_courses), 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Avg Courses/Student</p>
              <p className="text-2xl font-bold text-blue-900">
                {enrollmentData.length > 0 ? 
                  Math.round(enrollmentData.reduce((total, student) => 
                    total + getUniqueCoursesCount(student.enrolled_courses), 0
                  ) / enrollmentData.length * 10) / 10 : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-8">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900">Filter Students</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900"
            >
              <option value="">All Courses</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSelectedCourse('')}
              className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 border border-blue-200"
            >
              Clear Filter
            </button>
          </div>
        </div>
        {selectedCourse && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Showing <span className="font-medium">{filteredData.length}</span> students enrolled in{' '}
              <span className="font-medium">"{selectedCourse}"</span>
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Enrollment Details
            {selectedCourse && (
              <span className="ml-2 text-sm bg-blue-800 bg-opacity-50 px-2 py-1 rounded">
                Filtered: {filteredData.length} students
              </span>
            )}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                  Student ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                  Full Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                  Course Count
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                  Enrolled Courses
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filteredData.length > 0 ? (
                filteredData.map((student, index) => (
                  <tr 
                    key={student.stu_id} 
                    className={`hover:bg-blue-25 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-blue-25'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.stu_id.slice(-2)}
                          </span>
                        </div>
                        <span className="text-blue-900 font-medium">{student.stu_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-blue-900 font-medium">{student.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getUniqueCoursesCount(student.enrolled_courses)} courses
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {parseEnrolledCourses(student.enrolled_courses).map((course, courseIndex) => (
                          <span 
                            key={courseIndex}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                              course === selectedCourse 
                                ? 'bg-blue-200 text-blue-900 border-blue-400' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-blue-500">
                    No students found for the selected course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Student Course Enrollment Details Popup Component
const StudentCourseEnrollmentPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Student Course Enrollment Details
        </h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-white">
        <CourseEnrollmentTable />
      </div>
      
      <div className="p-6 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Constants
const GRADE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 1);
const MOCK_STUDENTS = [
  {
    stu_id: "STU001",
    Fname: "John",
    Lname: "Smith",
    EmailAddress: "john.smith@example.com",
    Tel_no: 1234567890,
    Gender: "M",
    Enroll_date: "2024-03-15",
    Dob: "2010-05-12",
    Grade: "8",
    School: "Central High School",
    Parent_tel: "9876543210",
    NIC: "200012345678",
    City: "Austin"
  },
  {
    stu_id: "STU002",
    Fname: "Emma",
    Lname: "Johnson",
    EmailAddress: "emma.j@example.com",
    Tel_no: 2345678901,
    Gender: "F",
    Enroll_date: "2024-02-20",
    Dob: "2009-08-25",
    Grade: "9",
    School: "Oak Valley School",
    Parent_tel: "8765432109",
    NIC: "200112345679",
    City: "Houston"
  },
  {
    stu_id: "STU003",
    Fname: "Michael",
    Lname: "Davis",
    EmailAddress: "michael.d@example.com",
    Tel_no: 3456789012,
    Gender: "M",
    Enroll_date: "2024-03-01",
    Dob: "2008-11-30",
    Grade: "10",
    School: "Pine Ridge Academy",
    Parent_tel: "7654321098",
    NIC: "200212345680",
    City: "Dallas"
  },
  {
    stu_id: "STU004",
    Fname: "Sophia",
    Lname: "Brown",
    EmailAddress: "sophia.b@example.com",
    Tel_no: 4567890123,
    Gender: "F",
    Enroll_date: "2024-01-10",
    Dob: "2011-03-18",
    Grade: "7",
    School: "Elm Street School",
    Parent_tel: "6543210987",
    NIC: "200312345681",
    City: "San Antonio"
  },
  {
    stu_id: "STU005",
    Fname: "David",
    Lname: "Wilson",
    EmailAddress: "david.w@example.com",
    Tel_no: 5678901234,
    Gender: "M",
    Enroll_date: "2024-02-05",
    Dob: "2012-07-08",
    Grade: "6",
    School: "Cedar Lane Elementary",
    Parent_tel: "5432109876",
    NIC: "200412345682",
    City: "El Paso"
  }
];

// Utility functions
const getStudentProperty = (student, propName) => {
  if (student[propName] !== undefined) {
    return student[propName];
  }
  
  const lowerPropName = propName.toLowerCase();
  for (const key in student) {
    if (key.toLowerCase() === lowerPropName) {
      return student[key];
    }
  }
  
  return '';
};

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const phoneStr = phone.toString();
  return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

const getGenderDisplay = (gender) => {
  return gender === 'M'|| gender === 'm' ? 'Male' : 'Female';
};

const getGradeDisplay = (grade) => {
  return grade ? `Grade ${grade}` : '';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const normalizeDate = (dateFilter) => {
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateFilter)) {
    const [dd, mm, yyyy] = dateFilter.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateFilter;
};

const toIsoDate = (input) => {
  const d = new Date(input);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// API functions
const fetchStudentData = async () => {
  try {
    const res = await fetch("/api/get.student.profile.data.routes/get.student.profile.data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await res.json();
    if (res.status === 200) {
      return data;
    } else {
      console.error("Error fetching student data");
      return MOCK_STUDENTS;
    }
  } catch (error) {
    console.error("Error fetching student data:", error);
    return MOCK_STUDENTS;
  }
};

// Filter functions
const filterStudents = (students, filters) => {
  const { searchTerm, studentIdFilter, dateFilter, gradeFilter } = filters;
  let results = students;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(student => 
      (student.Fname && student.Fname.toLowerCase().includes(term)) || 
      (student.Lname && student.Lname.toLowerCase().includes(term))
    );
  }

  if (studentIdFilter) {
    results = results.filter(student => 
      student.stu_id.toLowerCase().includes(studentIdFilter.toLowerCase())
    );
  }

  if (gradeFilter) {
    results = results.filter(student => 
      student.Grade && student.Grade.toString() === gradeFilter
    );
  }

  if (dateFilter) {
    const filterIso = normalizeDate(dateFilter);
    results = results.filter(student => {
      if (!student.Enroll_date) return false;
      return toIsoDate(student.Enroll_date) === filterIso;
    });
  }

  return results;
};

// Table Components
const TableHeader = ({ isModal = false }) => (
  <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0">
    <tr>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-28' : ''}`}>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Student ID
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-40' : ''}`}>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Name
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-56' : ''}`}>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-center font-semibold ${isModal ? 'min-w-20' : ''}`}>
        Gender
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-32' : ''}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Enrolled
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-32' : ''}`}>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-32' : ''}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Birth Date
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-center font-semibold min-w-[100px]`}>
        <div className="flex items-center gap-2 justify-center">
          <GraduationCap className="w-4 h-4" />
          Grade
        </div>
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-48' : ''}`}>
        School
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-32' : ''}`}>
        Parent Phone
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-32' : ''}`}>
        NIC
      </th>
      <th scope="col" className={`px-4 py-${isModal ? '4' : '3'} text-left font-semibold ${isModal ? 'min-w-28' : ''}`}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          City
        </div>
      </th>
    </tr>
  </thead>
);

const StudentRow = ({ student, index, isModal = false }) => (
  <tr className={`${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition-colors duration-200`}>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-md text-xs inline-block">
        {student.stu_id}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="font-medium text-gray-900">
        {getStudentProperty(student, 'Fname')} {getStudentProperty(student, 'Lname')}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
        {getStudentProperty(student, 'EmailAddress') || getStudentProperty(student, 'email') || getStudentProperty(student, 'Email')}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} text-center ${isModal ? 'whitespace-nowrap' : ''}`}>
      <span className="text-sm font-medium text-gray-700">
        {getGenderDisplay(getStudentProperty(student, 'Gender'))}
      </span>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="text-sm font-medium text-gray-700">
        {formatDate(getStudentProperty(student, 'Enroll_date'))}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="font-mono text-sm text-gray-700">
        {formatPhoneNumber(getStudentProperty(student, 'Tel_no'))}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="text-sm text-gray-700">
        {formatDate(getStudentProperty(student, 'Dob'))}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} text-center ${isModal ? 'whitespace-nowrap' : 'whitespace-nowrap'}`}>
      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
        {getGradeDisplay(getStudentProperty(student, 'Grade'))}
      </span>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className={`text-sm text-gray-700 ${isModal ? '' : 'max-w-xs truncate'}`} title={getStudentProperty(student, 'School')}>
        {getStudentProperty(student, 'School')}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="font-mono text-sm text-gray-700">
        {formatPhoneNumber(getStudentProperty(student, 'Parent_tel'))}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="font-mono text-sm text-gray-700">
        {getStudentProperty(student, 'NIC')}
      </div>
    </td>
    <td className={`px-4 py-${isModal ? '4' : '3'} ${isModal ? 'whitespace-nowrap' : ''}`}>
      <div className="text-sm text-gray-700">
        {getStudentProperty(student, 'City')}
      </div>
    </td>
  </tr>
);

const EmptyState = () => (
  <tr className="bg-white">
    <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
      <div className="flex flex-col items-center gap-2">
        <User className="w-12 h-12 text-gray-300" />
        <span className="text-lg font-medium">No students found</span>
        <span className="text-sm">Try adjusting your search criteria</span>
      </div>
    </td>
  </tr>
);

const StudentTable = ({ students, isModal = false }) => (
  <div className={`${isModal ? 'overflow-x-auto bg-white rounded-lg shadow-lg border border-blue-200' : 'relative overflow-x-auto shadow-lg rounded-lg border border-blue-200'}`}>
    <table className={`w-full text-sm text-gray-700 ${isModal ? 'min-w-max' : ''}`}>
      <TableHeader isModal={isModal} />
      <tbody className="divide-y divide-blue-100">
        {students.length > 0 ? (
          students.map((student, index) => (
            <StudentRow key={student.stu_id} student={student} index={index} isModal={isModal} />
          ))
        ) : (
          <EmptyState />
        )}
      </tbody>
    </table>
  </div>
);

// Filter Components
const SearchFilters = ({ filters, onFilterChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search by student name..."
        value={filters.searchTerm}
        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
      />
    </div>
    
    <div>
      <input
        type="text"
        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Filter by Student ID..."
        value={filters.studentIdFilter}
        onChange={(e) => onFilterChange('studentIdFilter', e.target.value)}
      />
    </div>
    
    <div>
      <select
        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        value={filters.gradeFilter}
        onChange={(e) => onFilterChange('gradeFilter', e.target.value)}
      >
        <option value="">All Grades</option>
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade.toString()}>
            Grade {grade}
          </option>
        ))}
      </select>
    </div>
    
    <div>
      <input
        type="date"
        className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Filter by enrollment date..."
        value={filters.dateFilter}
        onChange={(e) => onFilterChange('dateFilter', e.target.value)}
      />
    </div>
  </div>
);

// Modal Component
const FullTableModal = ({ isOpen, onClose, students }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <h2 className="text-2xl font-bold">Student Details - Full View</h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-blue-50">
        <StudentTable students={students} isModal={true} />
      </div>
      
      <div className="p-6 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-blue-700 font-medium">
            Total: <span className="font-bold text-blue-800">{students.length}</span> students
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const StudentDetailsView = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseEnrollmentOpen, setIsCourseEnrollmentOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    studentIdFilter: '',
    dateFilter: '',
    gradeFilter: ''
  });

  useEffect(() => {
    const loadStudentData = async () => {
      const data = await fetchStudentData();
      setStudents(data);
      setFilteredStudents(data);
      console.log("student data:", data);
    };
    
    loadStudentData();
  }, []);

  useEffect(() => {
    const filtered = filterStudents(students, filters);
    setFilteredStudents(filtered);
  }, [filters, students]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div>
      <Header />
      <Sidebar />
      
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-blue-200 border-dashed rounded-lg shadow-md mt-14 bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Student Details</h1>
          
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Course Enrollment Button - Added above the main table */}
          <div className="mb-4">
            <button 
              onClick={() => setIsCourseEnrollmentOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Display Student Course Enrolment Details
            </button>
          </div>
          
          <StudentTable students={filteredStudents} />
          
          <div className="flex items-center justify-between mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium">
              Showing <span className="font-bold text-blue-800">{filteredStudents.length}</span> of{" "}
              <span className="font-bold text-blue-800">{students.length}</span> students
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              View Full Table
            </button>
          </div>
        </div>
      </div>

      <FullTableModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        students={filteredStudents} 
      />

      <StudentCourseEnrollmentPopup 
        isOpen={isCourseEnrollmentOpen} 
        onClose={() => setIsCourseEnrollmentOpen(false)} 
      />
    </div>
  );
};

export default StudentDetailsView;
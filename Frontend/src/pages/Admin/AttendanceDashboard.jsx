import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, BookOpen, Clock, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const StudentAttendanceTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch attendance data 
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/attendance/getStudentAttendance", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (!response.ok) {
        console.log('Failed to fetch attendance data:', response.status);
      }

      const data = await response.json();
    //   const records = Array.isArray(data) ? data : (data.data || data.records || []);
      const records = data.attendanceDetails.map((record, index) => ({
        id: index + 1,
        studentId: record.student_id,
        studentName: record.student_name,
        courseId: record.course_id,
        courseName: record.course_name,
        date: record.date,
        time: record.date.split('T')[1] || 'N/A',
        status: record.status,
        duration: record.week || "2 hours",
        instructor: record.teacher_name,
        attendancePercentage: record.attendance_percentage || 100
        }));
      setAttendanceData(records);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.message);
      
      // set sample data when API fails
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const sampleData = [
      {
        id: 1,
        studentId: 'STU001',
        studentName: 'Alice Johnson',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        date: '2024-07-10',
        time: '09:00 AM',
        status: 'Present',
        duration: '2 hours',
        instructor: 'Dr. Smith',
        attendancePercentage: 95
      },
      {
        id: 2,
        studentId: 'STU002',
        studentName: 'Bob Chen',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        date: '2024-07-10',
        time: '09:00 AM',
        status: 'Absent',
        duration: '2 hours',
        instructor: 'Dr. Smith',
        attendancePercentage: 78
      },
      {
        id: 3,
        studentId: 'STU003',
        studentName: 'Carol Williams',
        courseId: 'MATH201',
        courseName: 'Advanced Calculus',
        date: '2024-07-10',
        time: '11:00 AM',
        status: 'Present',
        duration: '1.5 hours',
        instructor: 'Prof. Johnson',
        attendancePercentage: 92
      },
      {
        id: 4,
        studentId: 'STU001',
        studentName: 'Alice Johnson',
        courseId: 'ENG102',
        courseName: 'English Literature',
        date: '2024-07-09',
        time: '02:00 PM',
        status: 'Late',
        duration: '1 hour',
        instructor: 'Dr. Brown',
        attendancePercentage: 88
      },
      {
        id: 5,
        studentId: 'STU004',
        studentName: 'David Rodriguez',
        courseId: 'PHY301',
        courseName: 'Quantum Physics',
        date: '2024-07-09',
        time: '10:00 AM',
        status: 'Present',
        duration: '3 hours',
        instructor: 'Prof. Wilson',
        attendancePercentage: 96
      },
      {
        id: 6,
        studentId: 'STU005',
        studentName: 'Emma Davis',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        date: '2024-07-08',
        time: '09:00 AM',
        status: 'Absent',
        duration: '2 hours',
        instructor: 'Dr. Smith',
        attendancePercentage: 72
      }
    ];
    setAttendanceData(sampleData);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Refresh data function
  const handleRefresh = () => {
    fetchAttendanceData();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return '✓';
      case 'absent':
        return '✗';
      case 'late':
        return '⏰';
      case 'excused':
        return '📋';
      default:
        return '?';
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredData = attendanceData.filter(record => {
    const matchesSearch = 
      record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Student Attendance Dashboard
                </h1>
                <p className="text-slate-600 mt-1">Track and monitor student attendance records</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Unable to Connect to Server</h3>
                <p className="text-red-600 text-sm mt-1">
                  {error}. Using sample data for demonstration.
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 mb-6">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-600 text-lg">Loading attendance records...</p>
              <p className="text-slate-500 text-sm mt-2">Fetching data from server...</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or course..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400 w-5 h-5" />
                <select
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-slate-800">{filteredData.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Present</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {filteredData.filter(r => r.status?.toLowerCase() === 'present').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredData.filter(r => r.status?.toLowerCase() === 'absent').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <span className="text-2xl">✗</span>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Late</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {filteredData.filter(r => r.status?.toLowerCase() === 'late').length}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Student Info</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Course Details</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Date & Time</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Week</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Instructor</th>
                    <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((record, index) => (
                    <tr 
                      key={record.id || index} 
                      className={`hover:bg-slate-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {record.studentName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{record.studentName || 'Unknown'}</p>
                            <p className="text-sm text-slate-600">{record.studentId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800">{record.courseName || 'Unknown Course'}</p>
                          <p className="text-sm text-slate-600">{record.courseId || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-800">{formatDate(record.date)}</p>
                            <p className="text-sm text-slate-600">{record.time || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                          <span className="mr-1">{getStatusIcon(record.status)}</span>
                          {record.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{record.duration || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <span className="text-slate-700">{record.instructor || 'N/A'}</span>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <span className={`font-semibold ${getAttendanceColor(record.attendancePercentage)}`}>
                          {record.attendancePercentage ? `${record.attendancePercentage}%` : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg">No attendance records found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceTable;
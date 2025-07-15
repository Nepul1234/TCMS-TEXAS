import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";
import useUserData from '../../components/hooks/courseData';
import { 
  BarChart3, BookOpen, Users, FileText, Download, Filter, Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Gradings = () => {
  // State for API data
  const [studentMarks, setStudentMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editing states
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { courseData } = useUserData();


  // Fetch student marks from API
  useEffect(() => {
    fetchStudentMarks();
  }, []);

  const fetchStudentMarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get_all_student_marks/get_all_student_marks');
      if (!response.ok) {
        throw new Error('Failed to fetch student marks');
      }
      const data = await response.json();
      setStudentMarks(data);
      setFilteredMarks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = studentMarks;

    if (selectedGrade) {
      filtered = filtered.filter(student => student.Grade === parseInt(selectedGrade));
    }

    if (selectedCourse) {
      filtered = filtered.filter(student => student.course_id === selectedCourse);
    }

    if (searchQuery) {
      filtered = filtered.filter(student => 
        student.Fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.Lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.stu_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMarks(filtered);
  }, [selectedGrade, selectedCourse, searchQuery, studentMarks]);

  // Get unique values for filters
  const getUniqueGrades = () => {
    return [...new Set(studentMarks.map(student => student.Grade))].sort((a, b) => a - b);
  };

  const getUniqueCourses = () => {
    return [...new Set(studentMarks.map(student => ({
      id: student.course_id,
      name: student.course_name
    })))].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Handle cell editing
  const handleCellClick = (markId, field, currentValue) => {
    setEditingCell({ markId, field });
    setEditValue(currentValue || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      const response = await fetch(`api/get_all_student_marks/update_student_marks/${editingCell.markId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [editingCell.field]: editValue ? parseInt(editValue) : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update marks');
      }

      // Update local state
      setStudentMarks(prevMarks =>
        prevMarks.map(mark =>
          mark.mark_id === editingCell.markId
            ? { ...mark, [editingCell.field]: editValue ? parseInt(editValue) : null }
            : mark
        )
      );

      setEditingCell(null);
      setEditValue('');
    } catch (err) {
      alert('Error updating marks: ' + err.message);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalStudents = filteredMarks.length;
    const uniqueCourses = getUniqueCourses().length;
    const totalMarks = filteredMarks.reduce((acc, student) => {
      const marks = [
        student.first_test_marks,
        student.second_test_marks,
        student.third_test_marks,
        student.assignment_marks,
        student.quiz_marks
      ].filter(mark => mark !== null);
      return acc + marks.reduce((sum, mark) => sum + mark, 0);
    }, 0);
    const totalMarkEntries = filteredMarks.reduce((acc, student) => {
      return acc + [
        student.first_test_marks,
        student.second_test_marks,
        student.third_test_marks,
        student.assignment_marks,
        student.quiz_marks
      ].filter(mark => mark !== null).length;
    }, 0);

    return {
      totalStudents,
      uniqueCourses,
      averageMarks: totalMarkEntries > 0 ? Math.round(totalMarks / totalMarkEntries) : 0
    };
  };

  // Generate chart data from API response
  const getChartData = () => {
    const courseData = {};
    
    filteredMarks.forEach(student => {
      if (!courseData[student.course_name]) {
        courseData[student.course_name] = {
          first_test: [],
          second_test: [],
          third_test: [],
          assignment: [],
          quiz: []
        };
      }
      
      if (student.first_test_marks) courseData[student.course_name].first_test.push(student.first_test_marks);
      if (student.second_test_marks) courseData[student.course_name].second_test.push(student.second_test_marks);
      if (student.third_test_marks) courseData[student.course_name].third_test.push(student.third_test_marks);
      if (student.assignment_marks) courseData[student.course_name].assignment.push(student.assignment_marks);
      if (student.quiz_marks) courseData[student.course_name].quiz.push(student.quiz_marks);
    });

    return Object.entries(courseData).map(([course, marks]) => ({
      course,
      'First Test': marks.first_test.length > 0 ? Math.round(marks.first_test.reduce((a, b) => a + b, 0) / marks.first_test.length) : 0,
      'Second Test': marks.second_test.length > 0 ? Math.round(marks.second_test.reduce((a, b) => a + b, 0) / marks.second_test.length) : 0,
      'Third Test': marks.third_test.length > 0 ? Math.round(marks.third_test.reduce((a, b) => a + b, 0) / marks.third_test.length) : 0,
      'Assignment': marks.assignment.length > 0 ? Math.round(marks.assignment.reduce((a, b) => a + b, 0) / marks.assignment.length) : 0,
      'Quiz': marks.quiz.length > 0 ? Math.round(marks.quiz.reduce((a, b) => a + b, 0) / marks.quiz.length) : 0
    }));
  };

  const statistics = getStatistics();
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 bg-gray-50">
            <div className="flex items-center justify-center h-full">
              <div className="text-blue-600">Loading...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 bg-gray-50">
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">Error: {error}</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800 flex items-center">
                <FileText className="mr-2" size={24} />
                Gradings Overview
              </h1>
              
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center">
                  <Filter className="mr-2 text-blue-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select 
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">All Grades</option>
                  {getUniqueGrades().map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>

                <select 
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={selectedCourse}
                  placeholder="select course "
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value=""></option>
                  {/* Mark */}
                  {courseData.map(course => (
                    <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                  ))}
                </select>

                <div className="flex items-center">
                  <Search className="mr-2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Courses</p>
                    <h3 className="text-2xl font-bold text-blue-800">{statistics.uniqueCourses}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <h3 className="text-2xl font-bold text-blue-800">{statistics.totalStudents}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Average Marks</p>
                    <h3 className="text-2xl font-bold text-blue-800">{statistics.averageMarks}%</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Course Performance Overview
                  </h2>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="First Test" stroke="#1e40af" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Second Test" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="Third Test" stroke="#60a5fa" />
                      <Line type="monotone" dataKey="Assignment" stroke="#93c5fd" />
                      <Line type="monotone" dataKey="Quiz" stroke="#bfdbfe" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Student Marks Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-blue-800">Student Marks</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        First Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Second Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Third Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Quiz
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMarks.map(student => (
                      <tr key={student.mark_id} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.stu_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.Fname} {student.Lname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.Grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.course_name}
                        </td>
                        
                        {/* Editable mark fields */}
                        {['first_test_marks', 'second_test_marks', 'third_test_marks', 'assignment_marks', 'quiz_marks'].map(field => (
                          <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingCell?.markId === student.mark_id && editingCell?.field === field ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="0"
                                  max="100"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleCellSave();
                                    if (e.key === 'Escape') handleCellCancel();
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={handleCellSave}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCellCancel}
                                  className="text-gray-600 hover:text-gray-800 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`cursor-pointer px-2 py-1 rounded ${
                                  student[field] === null 
                                    ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                                    : student[field] >= 90 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : student[field] >= 75 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                                onClick={() => handleCellClick(student.mark_id, field, student[field])}
                              >
                                {student[field] !== null ? `${student[field]}%` : 'Click to edit'}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Gradings;
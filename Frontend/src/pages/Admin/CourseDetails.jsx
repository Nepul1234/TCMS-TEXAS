import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  Eye,
  Trash2,
  X,
  Save,
  UserPlus,
  BookOpen,
  Star,
  TrendingUp,
  Currency,
  Turtle
} from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'students', 'teachers'
  const [editForm, setEditForm] = useState({});

  
  useEffect(() => {
    const fetchCourses = async () => {
      try{
      const res = await fetch('/api/courses/getAllCoursesWithStudentsAndTeachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.status === 200) {
        console.error('Error fetching courses');
        return;
      }
      setCourses(data);
      setFilteredCourses(data.courses);
    }
    
    catch (error) {
      console.error('Error fetching courses:', error);
    }
   }
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(course => course.level.toLowerCase() === selectedFilter);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedFilter, courses]);

  const handleOpenModal = (type, course = null) => {
    setModalType(type);
    setSelectedCourse(course);
    if (type === 'edit' && course) {
      setEditForm(course);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setEditForm({});
  };

  const handleSave = () => {
    // Simulate API call to save changes
    const updatedCourses = courses.map(course =>
      course.id === editForm.id ? editForm : course
    );
    setCourses(updatedCourses);
    handleCloseModal();
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={'src/assets/classes.png'} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {course.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">Grade: {course.grade}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Advanced' 
              ? 'bg-red-100 text-red-800'
              : course.level === 'Intermediate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {course.level}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{course.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{(course.students).length}/{course.maxStudents}</span>
          </div>
          <div className="flex items-center gap-2">
            <Currency className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Rs. {course.price}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('view', course)}
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View
          </button>         
         <button 
            onClick={() => handleOpenModal('students', course)}
            className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Users className="h-4 w-4" />
            Students
          </button>
        </div>
      </div>
    </div>
  );

  const Modal = () => {
    if (!showModal || !selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {modalType === 'view' && 'Course Details'}
          {modalType === 'edit' && 'Edit Course'}
          {modalType === 'students' && 'Enrolled Students'}
          {modalType === 'teachers' && 'Course Teachers'}
        </h2>
        <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
        </div>
        
        <div className="p-6">
        {modalType === 'view' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <img 
              src='src/assets/classes.png' // Replace with selectedCourse.image if available
              alt={selectedCourse.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            </div>
            <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedCourse.title}</h3>
              <p className="text-gray-600">{selectedCourse.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
              <span className="text-sm text-gray-500">Grade</span>
              <p className="font-medium">{selectedCourse.grade}</p>
              </div>
              <div>
              <span className="text-sm text-gray-500">Type</span>
              <p className="font-medium">{selectedCourse.type}</p>
              </div>
              <div>
              <span className="text-sm text-gray-500">Payments</span>
              <p className="font-medium">Rs. {selectedCourse.price}</p>
              </div>
              <div>
              <span className="text-sm text-gray-500">Enrolled</span>
              <p className="font-medium">
                {(selectedCourse.students ? selectedCourse.students.length : selectedCourse.enrolledStudents)}/{selectedCourse.maxStudents}
              </p>
              </div>
            </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <h4 className="font-semibold text-gray-900 mb-3">Schedule & Location</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{selectedCourse.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{selectedCourse.location}</span>
              </div>
            </div>
            </div>
            <div>
            <h4 className="font-semibold text-gray-900 mb-3">Course Period</h4>
            <div className="space-y-2">
              <div className="text-sm">
              <span className="text-gray-500">Start Date: </span>
              <span>{selectedCourse.startDate}</span>
              </div>
              <div className="text-sm">
              <span className="text-gray-500">End Date: </span>
              <span>{selectedCourse.endDate}</span>
              </div>
            </div>
            </div>
          </div>
          </div>
        )}
        
        {modalType === 'edit' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={editForm.level || ''}
              onChange={(e) => setEditForm({...editForm, level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={editForm.duration || ''}
              onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              value={editForm.price || ''}
              onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
            <input
              type="number"
              value={editForm.maxStudents || ''}
              onChange={(e) => setEditForm({...editForm, maxStudents: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
            <input
              type="text"
              value={editForm.schedule || ''}
              onChange={(e) => setEditForm({...editForm, schedule: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
            value={editForm.description || ''}
            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
            <Save className="h-4 w-4" />
            Save Changes
            </button>
            <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
            Cancel
            </button>
          </div>
          </div>
        )}
        
        {modalType === 'students' && (
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
            <p className="text-sm text-gray-600">
              {(selectedCourse.students ? selectedCourse.students.length : selectedCourse.enrolledStudents)} students enrolled
            </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Student
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Enrolled Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(selectedCourse.students || []).map((student) => (
              <tr key={student.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">{student.name}</td>
                <td className="py-3 px-4 text-gray-600">{student.email}</td>
                <td className="py-3 px-4 text-gray-600">{student.enrolledDate}</td>
                <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                  <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </td>
              </tr>
              ))}
            </tbody>
            </table>
          </div>
          </div>
        )}
        </div>
      </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses?.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{courses?.reduce((acc, course) => acc + course.enrolledStudents, 0)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses?.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Turtle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">40</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Currency className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {filteredCourses?.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <Modal />
    </div>
  );
};

export default CourseManagement;
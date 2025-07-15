import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";

// Beautiful Alert Component
const BeautifulAlert = ({ message, type, onClose }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          border: 'border-green-200',
          shadow: 'shadow-green-200/50'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          border: 'border-red-200',
          shadow: 'shadow-red-200/50'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          border: 'border-blue-200',
          shadow: 'shadow-blue-200/50'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={`fixed top-20 right-6 z-50 max-w-md w-full ${styles.bg} rounded-2xl shadow-2xl ${styles.shadow} border ${styles.border} overflow-hidden`}
    >
      <div className="relative p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {styles.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-lg leading-tight">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Animated progress bar */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
        />
      </div>
    </motion.div>
  );
};

const MyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [teacherData, setTeacherData] = useState({
    teacher_id: "",
    fname: "",
    lname: "",
    email: "",
    address: "",
    Dob: "",
    Gender: "",
    NIC: "",
    tel_no: "",
    qualification: "",
    enroll_date: "",
    password: "",
    profile_picture: null,
    profile_pic: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgurl, setImgUrl] = useState("");
  
  // State for beautiful alerts
  const [alert, setAlert] = useState(null);

  // Function to show beautiful alert
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    const temp = localStorage.getItem('user');
    const tempId = temp ? JSON.parse(temp).id : 'ID not found';
    
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    
    setTeacherData(prev => ({ ...prev, teacher_id: tempId }));
    
    const fetchTeacherData = async () => {
      try {
        const res = await fetch("/api/get_tutor_profile_data/get_tutor_profile_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tutor_id: tempId }) 
        });
        
        const data = await res.json();
        
        if (res.status === 200) {
          // Fix: data should be an object, not an array that needs mapping
          if (data) {
            const teacherInfo = data.data;
            setTeacherData(prev => ({
              ...prev,
              teacher_id: teacherInfo.teacher_id,
              fname: teacherInfo.Fname,
              lname: teacherInfo.Lname,
              email: teacherInfo.email,
              address: teacherInfo.address,
              Dob: teacherInfo.Dob,
              Gender: teacherInfo.Gender,
              NIC: teacherInfo.NIC,
              tel_no: teacherInfo.tel_no,
              qualification: teacherInfo.qualification,
              enroll_date: teacherInfo.enroll_date,
              profile_pic: teacherInfo.profile_pic
            }));
            
            // Fix: Access profile_pic from the correct source
            if (teacherInfo.profile_pic) {
              const imgurl = `data:image/jpeg;base64,${teacherInfo.profile_pic}`;
              setImgUrl(imgurl);
            } else {
              setImgUrl("https://via.placeholder.com/150");
            }
          } else {
            setImgUrl("https://via.placeholder.com/150");
          }
        } else {
          setError("Failed to fetch teacher data");
          setImgUrl("https://via.placeholder.com/150");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tutors data:", error);
        setError("Failed to fetch teacher data. Please try again.");
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/getTutorcoursesGetByTutorId/getByTutorId", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teacher_id: tempId })
        });
        
        const coursesData = await res.json();
        
        if (res.status === 200) {
          setCourses(coursesData);
        } else {
          console.error("Error fetching courses data:", coursesData);
        }
        setCoursesLoading(false);
      } catch (error) {
        console.error("Error fetching courses data:", error);
        setCoursesLoading(false);
      }
    };
    
    fetchTeacherData();
    fetchCourses();
  }, [navigate]);

  const validateInputs = () => {
    if (!teacherData.fname.trim()) {
      setError("First Name is required");
      return false;
    }
    if (!teacherData.lname.trim()) {
      setError("Last Name is required");
      return false;
    }
    if (!teacherData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!teacherData.qualification.trim()) {
      setError("Qualification is required");
      return false;
    }
    // Fix: Check if tel_no exists before validation
    if (teacherData.tel_no) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(teacherData.tel_no)) {
        setError("Telephone must be a valid 10-digit number");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    try {
      const data_new = new FormData();
      data_new.append("teacher_id", teacherData.teacher_id);
      data_new.append("fname", teacherData.fname);
      data_new.append("lname", teacherData.lname);
      data_new.append("email", teacherData.email);
      data_new.append("address", teacherData.address);
      data_new.append("Dob", teacherData.Dob);
      data_new.append("Gender", teacherData.Gender);
      data_new.append("NIC", teacherData.NIC);
      data_new.append("enroll_date", teacherData.enroll_date);
      data_new.append("tel_no", teacherData.tel_no);
      data_new.append("qualification", teacherData.qualification);
      
      // Fix: Only append profile_picture if it exists and is a File object
      if (teacherData.profile_picture && teacherData.profile_picture instanceof File) {
        data_new.append("profile_picture", teacherData.profile_picture);
      }

      const response = await fetch('/api/update.tutor.profile.data/update.tutor.profile.data', {
        method: 'PUT',
        body: data_new
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const responseData = await response.json();
      console.log("Update successful:", responseData);
      showAlert("Profile updated successfully!", 'success');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
      console.error("Error updating teacher data:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacherData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpdate = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Image file size must be less than 5MB");
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError("Please select a valid image file");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          // Update the image URL for display
          setImgUrl(e.target.result);
          
          // Update the profile picture in state
          setTeacherData(prev => ({
            ...prev,
            profile_picture: file
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    fileInput.click();
  };

  if (loading || coursesLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
  
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-blue-900">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-6 py-3 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
  
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-r-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
  
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6 overflow-hidden shadow-lg border-4 border-white">
                      <img
                        src={imgurl || "https://via.placeholder.com/150"}
                        alt="Tutor profile picture"
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                          <button
                            onClick={handleImageUpdate}
                            className="text-white text-sm font-medium bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                          >
                            Update Photo
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={handleImageUpdate}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Change Profile Picture
                      </button>
                    )}
                    <div className="text-center mt-4">
                      <h3 className="text-xl font-semibold text-blue-900 mb-2">
                        {teacherData.fname} {teacherData.lname}
                      </h3>
                      <p className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-sm">
                        ID: {teacherData.teacher_id}
                      </p>
                    </div>
                  </div>
  
                  {/* Personal Details Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">First Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="fname"
                              value={teacherData.fname || ''}
                              onChange={handleInputChange}
                              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                              {teacherData.fname || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Last Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="lname"
                              value={teacherData.lname || ''}
                              onChange={handleInputChange}
                              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                              {teacherData.lname || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Details (Non-editable) */}
                    <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border-l-4 border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Date of Birth</label>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                            {teacherData.Dob ? new Date(teacherData.Dob).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Gender</label>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                            {teacherData.Gender === 'M' || teacherData.Gender === 'm'? 'Male' : 'Female'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">NIC Number</label>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                            {teacherData.NIC || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Contact Information</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Email</label>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                            {teacherData.email || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Address</label>
                          {isEditing ? (
                            <textarea
                              name="address"
                              value={teacherData.address || ''}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                            />
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium min-h-[80px]">
                              {teacherData.address || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Telephone</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="tel_no"
                              value={teacherData.tel_no || ''}
                              onChange={handleInputChange}
                              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                              {teacherData.tel_no || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border-l-4 border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Professional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Qualification</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="qualification"
                              value={teacherData.qualification || ''}
                              onChange={handleInputChange}
                              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                              {teacherData.qualification || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Enrollment Date</label>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-blue-900 font-medium">
                            {teacherData.enroll_date ? new Date(teacherData.enroll_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutor Courses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                  <h2 className="text-2xl font-bold text-white">My Courses</h2>
                </div>
                
                <div className="p-8">
                  {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <div key={course.course_id} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-blue-900">{course.course_name}</h3>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Grade {course.grade}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-blue-700">
                              <span className="font-medium w-20">Time:</span>
                              <span className="text-blue-900">{course.start_time} - {course.end_time}</span>
                            </div>
                            
                            <div className="flex items-center text-blue-700">
                              <span className="font-medium w-20">Type:</span>
                              <span className="text-blue-900 capitalize">{course.course_type}</span>
                            </div>
                            
                            <div className="flex items-center text-blue-700">
                              <span className="font-medium w-20">Fees:</span>
                              <span className="text-blue-900 font-semibold">Rs. {course.Fees}</span>
                            </div>
                            
                            {course.weekday && (
                              <div className="flex items-center text-blue-700">
                                <span className="font-medium w-20">Day:</span>
                                <span className="text-blue-900 capitalize">{course.weekday}</span>
                              </div>
                            )}
                            
                            {course.hall_allocation && (
                              <div className="flex items-center text-blue-700">
                                <span className="font-medium w-20">Hall:</span>
                                <span className="text-blue-900">{course.hall_allocation}</span>
                              </div>
                            )}
                            
                            {course.description && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-800 text-sm">{course.description}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <span className="text-xs text-blue-600 font-medium">
                              Course ID: {course.course_id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-blue-900 mb-2">No Courses Found</h3>
                      <p className="text-blue-600">You don't have any courses assigned yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Beautiful Alert Component */}
      {alert && (
        <BeautifulAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default MyProfile;
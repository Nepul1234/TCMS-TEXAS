import { useState, useEffect } from "react"
import axios from "axios"

export const useProfileData = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    enrolledDate: "",
    phoneNumber: "",
    address: "",
    department: "",
    semester: "",
    profilePicture: "",
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  // Extract student ID from JWT token
  const getStudentIdFromToken = () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const userData = JSON.parse(atob(token.split('.')[1]))
      const id = userData.id
      console.log("Extracted student ID:", id)
      
      if (!id) {
        throw new Error("Student ID not found in token")
      }
      
      return id
    } catch (err) {
      console.error('Error extracting student ID from token:', err)
      throw new Error("Invalid authentication token")
    }
  }

  // Fetch student data from API
  const fetchStudentData = async () => {
    setIsLoading(true)
    try {
      const studentId = getStudentIdFromToken() // Get from token instead of hardcoded
      
      const response = await axios.post('/api/get_student_profile_data/getStudentProfileData', {
        student_id: studentId
      })
      
      if (response.data) {
        const profileData = {
          firstName: response.data.Fname,
          lastName: response.data.Lname,
          studentId: response.data.stu_id,
          email: response.data.Email,
          enrolledDate: response.data.Enroll_date,
          phoneNumber: response.data.Tel_no,
          address: response.data.Address,
          grade: response.data.Grade,
          school: response.data.School,
          profilePicture: response.data.p_picture || "",
        }
        
        setUserData(profileData)
        setError("")
      } else {
        setError("Failed to load profile data. Please try again later.")
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
      if (error.message.includes("token")) {
        setError("Authentication error. Please log in again.")
      } else {
        setError("Network error while loading profile data.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (formData) => {
    try {
      const updateData = {
        student_id: userData.studentId,
        fname: formData.firstName,
        lname: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber,
      }

      const data = new FormData();
      data.append('student_id', userData.studentId);
      data.append('fname', formData.firstName);
      data.append('lname', formData.lastName);
      data.append('email', formData.email);
      data.append('phone', formData.phoneNumber);
      data.append('address', formData.address);
      if (formData.profilePicture) {
        data.append('profile_picture', formData.profilePicture);
      }
      console.log("Sending update data:", data)
      
      const response = await axios.post('/api/get_profile_update/get_profile_update', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })


      
      if (response.data) {
        setUserData({
          ...userData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          profilePicture: formData.profilePicture || userData.profilePicture,
        })
        
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        setError("")
        return true
      } else {
        setError("Failed to update profile. Please try again.")
        return false
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Error updating profile. Please try again.")
      return false
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [])

  return {
    userData,
    isLoading,
    error,
    showSuccess,
    updateProfile,
    refetch: fetchStudentData
  }
}
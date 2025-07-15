import { useState, useEffect } from "react"

export const useFormValidation = (initialData) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profilePicture: "",
    
  })
  
  const [errors, setErrors] = useState({})

  // Initialize form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        address: initialData.address || "",
        profilePicture: initialData.profilePicture || "",
      })
    }
  }, [initialData])

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    // Phone number validation - exactly 10 digits
    const phoneRegex = /^\d{10}$/
    const cleanedPhone = String(formData.phoneNumber).replace(/\D/g, "")
    if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits"
    }
    
    // Name validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear validation error for this field when the user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  return {
    formData,
    setFormData,
    errors,
    validateForm,
    handleChange
  }
}
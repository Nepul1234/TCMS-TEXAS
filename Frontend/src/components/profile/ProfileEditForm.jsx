import { useState } from "react"
import { School, User, Mail, Phone, MapPin, Save } from "lucide-react"
import ProfilePictureUpload from './ProfilePictureUpload'
import { useFormValidation } from '../hooks/useFormValidation'

const ProfileEditForm = ({ userData, onSave, onCancel }) => {
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation(userData)
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    console.log("Form data ready to be saved:", formData)
    setIsLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

 


  const handleProfilePictureChange = (newImage) => {
    setFormData({
      ...formData,
      profilePicture: newImage
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
      {/* Header Banner */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        <div className="flex flex-col sm:flex-row items-center">
          <ProfilePictureUpload
            currentImage={formData.profilePicture}
            firstName={formData.firstName}
            lastName={formData.lastName}
            onImageChange={handleProfilePictureChange}
            isEditing={true}
          />
          
          <div className="ml-0 sm:ml-8 mt-4 sm:mt-0 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
            <p className="text-blue-100 flex items-center mt-1 justify-center sm:justify-start">
              <School className="h-4 w-4 mr-1" />
              Student ID: {userData.studentId}
            </p>
            <p className="text-blue-200 mt-2 text-sm max-w-md">
              Update your personal information and profile picture. Click on the profile image to change it.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            icon={<User className="h-4 w-4 text-blue-500 mr-1" />}
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />

          <FormField
            icon={<User className="h-4 w-4 text-blue-500 mr-1" />}
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />

          <FormField
            icon={<Mail className="h-4 w-4 text-blue-500 mr-1" />}
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <FormField
            icon={<Phone className="h-4 w-4 text-blue-500 mr-1" />}
            label="Phone Number (10 digits)"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            placeholder="10-digit number"
            required
          />

          <div className="md:col-span-2">
            <FormField
              icon={<MapPin className="h-4 w-4 text-blue-500 mr-1" />}
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors shadow-sm hover:shadow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

const FormField = ({ icon, label, name, type = "text", value, onChange, error, required = false, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      {icon}
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      required={required}
      placeholder={placeholder}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
)

export default ProfileEditForm

import { useRef, useState } from "react"
import { Camera, Upload, Trash2 } from "lucide-react"

const ProfilePictureUpload = ({ 
  currentImage, 
  firstName = "", 
  lastName = "", 
  onImageChange, 
  isEditing = false 
}) => {
  const fileInputRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(currentImage)

  const getInitials = () => {
    return (firstName?.charAt(0) || "") + (lastName?.charAt(0) || "")
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        onImageChange?.(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeProfilePicture = () => {
    setPreviewImage(null)
    onImageChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative group">
      <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg relative">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Profile"
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
            {getInitials()}
          </div>
        )}

        {/* Edit overlay - only show when editing */}
        {isEditing && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={triggerFileInput}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Profile picture actions - only show when editing */}
      {isEditing && (
        <div className="flex justify-center mt-2 space-x-2">
          <button
            type="button"
            onClick={triggerFileInput}
            className="p-1 bg-white rounded-full text-blue-600 hover:text-blue-800 transition-colors"
            title="Upload new picture"
          >
            <Upload className="h-4 w-4" />
          </button>
          {previewImage && (
            <button
              type="button"
              onClick={removeProfilePicture}
              className="p-1 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
              title="Remove picture"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfilePictureUpload

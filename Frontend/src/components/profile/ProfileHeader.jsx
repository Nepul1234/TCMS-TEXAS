import { User, Edit2, X } from "lucide-react"

const ProfileHeader = ({ isEditMode, onToggleEdit }) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="h-6 w-6 mr-2 text-blue-600" />
          My Profile
        </h1>
        <p className="text-sm text-gray-600 ml-8">
          View and manage your personal information
        </p>
      </div>
      
      <button
        onClick={onToggleEdit}
        className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all shadow-sm ${
          isEditMode
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
        }`}
      >
        {isEditMode ? (
          <>
            <X className="h-4 w-4 mr-1" /> Cancel
          </>
        ) : (
          <>
            <Edit2 className="h-4 w-4 mr-1" /> Edit Profile
          </>
        )}
      </button>
    </div>
  )
}

export default ProfileHeader
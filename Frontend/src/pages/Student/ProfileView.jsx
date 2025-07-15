import { useState } from "react"
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileDisplay from '../../components/profile/ProfileDisplay'
import ProfileEditForm from '../../components/profile/ProfileEditForm'
import LoadingSpinner from '../../components/profile/LoadingSpinner'
import NotificationMessages from '../../components/profile/NotificationMessages'
import { useProfileData } from '../../components/hooks/useProfileData'


const ProfileEditNew = () => {
  const { userData, isLoading, updateProfile, error, showSuccess } = useProfileData()
  const [isEditMode, setIsEditMode] = useState(false)

  const handleToggleEdit = () => {
    setIsEditMode(!isEditMode)
  }

  const handleSaveProfile = async (formData) => {
    const success = await updateProfile(formData)
    if (success) {
      setIsEditMode(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4 sm:p-6 pt-20 sm:ml-64 mt-15">
          <NotificationMessages 
            showSuccess={showSuccess}
            errorMessage={error}
          />
          
          <ProfileHeader 
            isEditMode={isEditMode}
            onToggleEdit={handleToggleEdit}
          />

          {isEditMode ? (
            <ProfileEditForm
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ProfileDisplay userData={userData} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileEditNew
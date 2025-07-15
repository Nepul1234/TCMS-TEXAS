import { 
  Mail, Phone, Calendar, School, User, MapPin, 
  GraduationCap, Briefcase 
} from "lucide-react"

const ProfileDisplay = ({ userData }) => {
  const getInitials = () => {
    return (userData.firstName?.charAt(0) || "") + (userData.lastName?.charAt(0) || "")
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
      {/* Header Banner */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                  {getInitials()}
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-0 sm:ml-8 mt-4 sm:mt-0 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-blue-100 flex items-center mt-1 justify-center sm:justify-start">
              <School className="h-4 w-4 mr-1" />
              Student ID: {userData.studentId}
            </p>
            <div className="flex items-center mt-3 space-x-3 justify-center sm:justify-start">
              <span className="bg-blue-500 bg-opacity-30 text-white px-3 py-1 rounded-full text-xs flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                Grade: {userData.grade || "N/A"}
              </span>
              <span className="bg-blue-500 bg-opacity-30 text-white px-3 py-1 rounded-full text-xs flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                School: {userData.school}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
      </div>

      {/* Profile Information Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ProfileInfoCard
              icon={<Mail className="h-4 w-4 text-blue-500 mr-1" />}
              label="Email Address"
              value={userData.email}
            />
            <ProfileInfoCard
              icon={<Phone className="h-4 w-4 text-blue-500 mr-1" />}
              label="Phone Number"
              value={userData.phoneNumber}
            />
            <ProfileInfoCard
              icon={<MapPin className="h-4 w-4 text-blue-500 mr-1" />}
              label="Address"
              value={userData.address}
            />
          </div>

          <div className="space-y-4">
            <ProfileInfoCard
              icon={<User className="h-4 w-4 text-blue-500 mr-1" />}
              label="Full Name"
              value={`${userData.firstName} ${userData.lastName}`}
            />
            <ProfileInfoCard
              icon={<Calendar className="h-4 w-4 text-blue-500 mr-1" />}
              label="Enrolled Date"
              value={userData.enrolledDate ? new Date(userData.enrolledDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "N/A"}
            />
            <ProfileInfoCard
              icon={<Briefcase className="h-4 w-4 text-blue-500 mr-1" />}
              label="Student Status"
              value={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileInfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
    <div className="text-sm text-gray-500 mb-1 flex items-center">
      {icon}
      {label}
    </div>
    <div className="text-gray-800 font-medium pl-5">{value}</div>
  </div>
)

export default ProfileDisplay
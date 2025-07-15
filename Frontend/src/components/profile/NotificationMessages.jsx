import { CheckCircle, AlertCircle } from "lucide-react"

const NotificationMessages = ({ showSuccess, errorMessage }) => {
  return (
    <>
      {/* Success message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center z-50 animate-fade-in-down">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          <span>Profile updated successfully!</span>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </>
  )
}

export default NotificationMessages
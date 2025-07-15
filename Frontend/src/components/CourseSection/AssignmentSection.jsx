
import { FileText, Clock } from 'lucide-react';

const AssignmentSection = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Course Assignments</h2>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Factors Activity</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Due Soon</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Solve this actvity questions</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-3">Points: 50</span>
                <FileText className="w-4 h-4 mr-1" />
                <span>Individual</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">Due: May 22, 2025</div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Logarithms Activity</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Open</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Provide answers for these questions</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-3">Points: 50</span>
                <FileText className="w-4 h-4 mr-1" />
                <span>Individual </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">Due: June 5, 2025</div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-gray-400 mr-3 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Coordiation Geometry</h3>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Not Available</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Solve this assignment questions</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-3">Points: 100</span>
                <FileText className="w-4 h-4 mr-1" />
                <span>Individual</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">Available: June 12, 2025</div>
                <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded cursor-not-allowed">
                  Not Available Yet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSection;
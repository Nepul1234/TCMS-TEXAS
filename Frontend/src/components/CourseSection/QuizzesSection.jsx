import { HelpCircle, Clock, AlertCircle } from 'lucide-react';

export const QuizzesSection = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Quizzes</h2>
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <HelpCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Geometry Basics Quiz</h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Available</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Test your knowledge of Geometry rules</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="mr-3">20 minutes</span>
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>10 questions</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">Due: May 18, 2025</div>
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <HelpCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Logarithms </h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Available</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Test your understanding of Logarithms</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="mr-3">20 minutes</span>
              <AlertCircle className="w-4 h-4 mr-1" />Quiz
              <span>8 questions</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">Due: June 1, 2025</div>
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <HelpCircle className="w-6 h-6 text-gray-400 mr-3 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Factors</h3>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Test your knowledge</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="mr-3">45 minutes</span>
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>15 questions</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">Available: June 10, 2025</div>
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
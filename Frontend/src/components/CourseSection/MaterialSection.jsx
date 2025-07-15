import {BookOpen} from 'lucide-react';

export const MaterialsSection = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h2>
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">Introduction to Geometry</h3>
            <p className="text-sm text-gray-500">Basic formulas of geometry and simple solved questions</p>
          </div>
          <button className="ml-auto px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
            Download
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">Logarithms Basics</h3>
            <p className="text-sm text-gray-500">Solved questions and basic activities</p>
          </div>
          <button className="ml-auto px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
            Download
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">Factors</h3>
            <p className="text-sm text-gray-500">Rules of factors</p>
          </div>
          <button className="ml-auto px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
);

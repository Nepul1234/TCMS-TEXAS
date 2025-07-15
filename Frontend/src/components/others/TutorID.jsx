import React from 'react';

const TutorIdCard = ({
  photoUrl,
  name,
  studentId,
  enrollDate,
}) => {
  return (
    <div className="w-full max-w-lg  bg-white rounded-lg shadow-md p-6">
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="w-32 h-32 border-4 border-blue-500 rounded-lg overflow-hidden">
          <img
            src={photoUrl}
            alt={`${name}'s photo`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tutor ID Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <p className="text-gray-600 text-sm mt-1">Tutor ID: {studentId}</p>
        </div>
      </div>

      {/* Enrollment Date eka */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Enrolled:</span> {enrollDate}
        </p>
      </div>
    </div>
  );
};


TutorIdCard.defaultProps = {
  photoUrl: 'https://via.placeholder.com/128', // Default placeholder image
  name: 'John Doe',
  studentId: '00000000',
  enrollDate: 'January 1, 2023',
};

export default TutorIdCard;
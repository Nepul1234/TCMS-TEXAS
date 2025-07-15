import { useState } from 'react';

const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [openSections, setOpenSections] = useState({});
  const isTeacher = false;

  // Sample data
  const courseSections = [
    {
      id: 1,
      title: "Geometry",
      summary: "Work sheet",
      resources: [
        { type: 'pdf', title: "Course Syllabus", date: "2024-03-01" },
        { type: 'video', title: "Lecture 1: HTML Basics", date: "2024-03-05" },
        { type: 'quiz', title: "Week 1 Quiz", date: "2024-03-10" },
      ],
    },
  ];

  const quizStatus = {
    'Week 1 Quiz': { attempted: true, score: '8/10' },
    'Week 2 Quiz': { attempted: false, score: null }
  };

  const grades = [
    { assignment: "Week 1 Quiz", score: "8/10", date: "2024-03-12" },
    { assignment: "HTML Assignment", score: "95%", date: "2024-03-15" }
  ];

  const participants = [
    { name: "John Doe", role: "Teacher", online: true },
    { name: "Alice Smith", role: "Student", online: false },
    { name: "Bob Johnson", role: "Student", online: true }
  ];

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Components
  const ContentSection = () => (
    <div className="lg:col-span-3">
      {courseSections.map((section) => (
        <div key={section.id} className="mb-6 bg-white rounded-lg shadow">
          <div className="p-4 bg-gray-50 rounded-t-lg flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{section.summary}</p>
            </div>
            <button 
              onClick={() => toggleSection(section.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              {openSections[section.id] ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {openSections[section.id] && (
            <div className="p-4 space-y-3">
              {section.resources.map((resource, index) => (
                <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-8 text-gray-500">
                    {resource.type === 'pdf' && '📄'}
                    {resource.type === 'video' && '🎥'}
                    {resource.type === 'quiz' && '📝'}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-sm text-gray-500">Posted {resource.date}</p>
                    {resource.type === 'quiz' && (
                      <div className="mt-1 text-sm">
                        {quizStatus[resource.title].attempted ? (
                          <span className="text-green-600">
                            Attempted • Score: {quizStatus[resource.title].score}
                          </span>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-800">
                            Attempt Quiz
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const GradesSection = () => (
    <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Grades</h2>
      <div className="space-y-4">
        {grades.map((grade, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{grade.assignment}</h3>
                <p className="text-gray-600 text-sm">Submitted {grade.date}</p>
              </div>
              <span className="text-lg font-bold text-blue-600">{grade.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ParticipantsSection = () => (
    <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Participants</h2>
      <div className="space-y-4">
        {participants.map((participant, index) => (
          <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
            <div className={`w-3 h-3 rounded-full mr-4 ${participant.online ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <h3 className="font-semibold">{participant.name}</h3>
              <p className="text-gray-600 text-sm">{participant.role}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg">
              Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maths</h1>
              <p className="mt-2 text-gray-600">Instructor: Anura Rajapaksha</p>
            </div>
          </div>
          
          <nav className="mt-6 flex space-x-8">
            {['content', 'grades', 'participants'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          {activeTab === 'content' && <ContentSection />}
          {activeTab === 'grades' && <GradesSection />}
          {activeTab === 'participants' && <ParticipantsSection />}

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {activeTab === 'content' && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-3">Your Deadlines</h3>
                <div className="text-sm space-y-2">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <p className="font-medium">Week 1 Quiz</p>
                    <p className="text-gray-600">Due March 20</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <p className="font-medium">Assignment 1</p>
                    <p className="text-gray-600">Due March 25</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
import React from 'react';

const CourseDescription = () => {
  // This would typically come from your API or props
  const course = {
    id: "cs101",
    title: "Introduction to Computer Science",
    instructor: "Dr. Jane Smith",
    duration: "12 weeks",
    level: "Beginner",
    category: "Computer Science",
    rating: 4.8,
    totalStudents: 2345,
    description: "This comprehensive introduction to computer science covers fundamental concepts including algorithms, data structures, and programming basics. Perfect for beginners looking to build a strong foundation in CS principles.",
    whatYouWillLearn: [
      "Understand core computer science principles",
      "Write basic programs in Python",
      "Analyze and solve problems using algorithms",
      "Work with fundamental data structures",
      "Understand computational thinking"
    ],
    syllabus: [
      {
        week: 1,
        title: "Introduction to Computing",
        topics: ["Course overview", "History of computing", "Binary and number systems"],
      },
      {
        week: 2,
        title: "Algorithmic Thinking",
        topics: ["Problem solving strategies", "Algorithm design", "Pseudocode"],
      },
      {
        week: 3,
        title: "Programming Fundamentals",
        topics: ["Variables and data types", "Control structures", "Functions"],
      }
      // Additional weeks would be included here
    ],
    requirements: ["No prior programming experience required", "Basic math skills", "Computer with internet access"],
    imageUrl: "/api/placeholder/800/400"
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation breadcrumb */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <nav className="text-sm">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <a href="#" className="text-gray-500 hover:text-gray-700">Courses</a>
                <span className="mx-2 text-gray-400">/</span>
              </li>
              <li className="flex items-center">
                <a href="#" className="text-gray-500 hover:text-gray-700">{course.category}</a>
                <span className="mx-2 text-gray-400">/</span>
              </li>
              <li className="text-blue-600">{course.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Course hero section */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column: Image */}
            <div className="md:col-span-1">
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="w-full rounded-lg shadow-lg"
              />
              <div className="mt-4 space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md">
                  Enroll Now
                </button>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-semibold text-lg mb-2">Course Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Duration:</div>
                    <div>{course.duration}</div>
                    <div className="text-gray-600">Level:</div>
                    <div>{course.level}</div>
                    <div className="text-gray-600">Students:</div>
                    <div>{course.totalStudents.toLocaleString()}</div>
                    <div className="text-gray-600">Rating:</div>
                    <div className="flex items-center">
                      {course.rating} 
                      <span className="ml-1 text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Course content */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="mt-2 text-gray-600">Instructor: {course.instructor}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <p className="text-gray-700">{course.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Course Syllabus</h2>
                <div className="space-y-4">
                  {course.syllabus.map((week) => (
                    <div key={week.week} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer">
                        <div>
                          <span className="font-medium">Week {week.week}: </span>
                          <span>{week.title}</span>
                        </div>
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="px-4 py-3 bg-white">
                        <ul className="list-disc pl-5 space-y-1">
                          {week.topics.map((topic, index) => (
                            <li key={index} className="text-gray-700">{topic}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDescription;
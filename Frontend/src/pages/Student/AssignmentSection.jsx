import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

const AssignmentSection = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const assignments = [
    {
      name: 'Assignment 2 on Advanced Concepts',
      course: 'Nutrition: Build Your Perfect Diet & Meal Plan',
      totalPoints: 20,
      totalSubmits: 4,
    },
    {
      name: 'Control Structure Assignment',
      course: 'PHP Beginners – Become a PHP Master',
      totalPoints: 10,
      totalSubmits: 4,
    },
    {
      name: 'Data Structures Assignment',
      course: 'PHP Beginners – Become a PHP Master',
      totalPoints: 5,
      totalSubmits: 3,
    },
    {
      name: 'Assignment on Basic Concepts',
      course: 'Nutrition: Build Your Perfect Diet & Meal Plan',
      totalPoints: 10,
      totalSubmits: 8,
    },
    {
      name: 'Assignment on Advanced Concepts',
      course: 'Nutrition: Build Your Perfect Diet & Meal Plan',
      totalPoints: 15,
      totalSubmits: 7,
    },
  ];

  return (
    <div className="flex">
      <Header/>
      <Sidebar/>

      {/* Main Content */}
      <div className={`flex-1 p-6 ml-64 transition-all duration-300 mt-20 ${sidebarOpen ? 'ml-0' : 'ml-64'}`}>
        <div className="flex justify-between mb-4">
          <h2 className="text-3xl font-semibold text-gray-800">Assignments</h2>
          <div className="flex space-x-4">
            <select className="border p-2 rounded-md">
              <option>All</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
            <select className="border p-2 rounded-md">
              <option>Sort by DESC</option>
              <option>Sort by ASC</option>
            </select>
            <button
              onClick={() => setSidebarOpen(<Sidebar/>)}
              className="bg-blue-500 text-white p-2 rounded-md"
            >
              {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </button>
          </div>
        </div>

        <motion.div
          className="overflow-x-auto shadow-md rounded-lg bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">Course Name</th>
                <th scope="col" className="py-3 px-6">Course</th>
                <th scope="col" className="py-3 px-6">Total Points</th>
                <th scope="col" className="py-3 px-6">Total Submits</th>
                <th scope="col" className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => (
                <motion.tr
                  key={index}
                  className="bg-white border-b hover:bg-gray-100 transition-all duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="py-4 px-6">{assignment.name}</td>
                  <td className="py-4 px-6">{assignment.course}</td>
                  <td className="py-4 px-6 font-semibold">{assignment.totalPoints}</td>
                  <td className="py-4 px-6">{assignment.totalSubmits}</td>
                  <td className="py-4 px-6">
                    <button className="text-white bg-blue-500 py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                      Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default AssignmentSection;

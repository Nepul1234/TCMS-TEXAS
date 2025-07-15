// components/DashboardMetrics.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    enrolledCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    userRole: '',
    userId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token'); 
        
        const response = await fetch('/api/dashboard/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setMetrics(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch metrics');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Dynamic title based on user role
  const getCoursesTitle = () => {
    if (metrics.userRole === 'student') {
      return 'My Enrolled Courses';
    } else if (metrics.userRole === 'teacher') {
      return 'Active Courses';
    } else {
      return 'Total Active Courses';
    }
  };

  // Metrics configuration
  const metricsConfig = [
    {
      id: 1,
      title: getCoursesTitle(),
      value: metrics.enrolledCourses,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Total Students",
      value: metrics.totalStudents,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: "green",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Total Teachers",
      value: metrics.totalTeachers,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      color: "yellow",
      bgGradient: "from-yellow-600 to-yellow-400",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 50, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const counter = {
    hidden: { opacity: 0, scale: 0.5 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        delay: 0.3,
      },
    },
  };

  const iconAnimation = {
    hidden: { rotate: -20, opacity: 0 },
    show: {
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.5,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-gray-200 rounded-xl h-48 animate-pulse">
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="w-10 h-10 bg-gray-300 rounded-full mb-4"></div>
              <div className="w-24 h-6 bg-gray-300 rounded mb-2"></div>
              <div className="w-16 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3" variants={container} initial="hidden" animate="show">
      {metricsConfig.map((metric) => (
        <motion.div
          key={metric.id}
          className={`relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-br ${metric.bgGradient} text-white`}
          variants={item}
          whileHover={{
            y: -10,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.3 },
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-white opacity-10"></div>

          <div className="p-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <motion.div className={`mb-4 text-white`} variants={iconAnimation} initial="hidden" animate="show">
                {metric.icon}
              </motion.div>

              <h3 className="text-xl font-semibold text-white mb-2">{metric.title}</h3>

              <motion.div className="relative" variants={counter} initial="hidden" animate="show">
                <motion.span
                  className="text-5xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  {metric.value}
                </motion.span>
                <motion.div
                  className="absolute -inset-1 rounded-lg"
                  initial={{ opacity: 0.3, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                  style={{ border: `2px solid rgba(255, 255, 255, 0.5)` }}
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardMetrics;
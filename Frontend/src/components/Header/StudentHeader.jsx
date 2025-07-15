import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useProfileData } from "../hooks/useProfileData";



export default function Header() {
  const logo = "src/assets/logo.png"; // Define the logo path
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth(); // Get the user data from context
  const navigate = useNavigate(); // Add navigate hook for redirection
  const { userData, isLoading, error, showSuccess } = useProfileData();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout function
  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate('/login'); // Redirect to login page
  };
  
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <Link to='/student/home'>
            <div className="flex items-center">
              <a href="#" className="flex ms-2 md:me-24">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7vFjF1iF-N_8FpALJMai32zhBUibWruzmFA&s"
                  className="h-8 me-3"
                  alt="FlowBite Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                  Texas Institute 
                </span>
              </a>
            </div>
          </Link>
          
          {/* Right Side - Profile Dropdown */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              {/* Profile Button */}
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-12 h-10 rounded-full"
                  src={userData.profilePicture || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                  alt="User"
                />
              </button>
              
              {/* Dropdown Menu (Visible when `isOpen` is true) */}
              {isOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded shadow-md dark:bg-gray-700 dark:divide-gray-600"
                >
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user ? user.role : "Guest"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">
                      {user ? user.email : "Not logged in"}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/home"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/student/profile_edit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
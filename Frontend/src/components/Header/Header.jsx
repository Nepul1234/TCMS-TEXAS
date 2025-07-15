import React, { useState, useRef, useEffect } from "react";
import { AlignJustify } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUserDetails } from '../hooks/UserDetails';
// const { userDetails, loading, error } = useUserDetails();

export default function Header() {
  const logo = "src/assets/logo.png"; // Define the logo path
  const { user, logout } = useAuth();
  const { imageUrl } = useUserDetails();
  const role = user?.role || "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <a href="#" className="flex ms-2 md:me-24">
              <img
                src={logo}
                className="h-8 me-3"
                alt="FlowBite Logo"
              />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                Texas Institute
              </span>
            </a>
          </div>

          {/* Right Side */}
          <div className="lg:order-2 relative" ref={dropdownRef}>
            <div className="flex items-center gap-4">
              <p className="text-lg font-light hidden sm:block">
                Hello, {user?.username ?? "Guest"}
              </p>

              {/* Mobile Menu Button */}
              <button
                className="flex text-sm rounded-full focus:bg-gray-400 lg:hidden"
                onClick={() => {
                  setIsOpen(false);
                  setMenuOpen(!isMenuOpen);
                }}
              >
                <AlignJustify />
              </button>

              {/* Profile Dropdown Button */}
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={() => {
                  setIsOpen(!isOpen);
                  setMenuOpen(false);
                }}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-8 h-8 rounded-full"
                  src={imageUrl}
                  alt="User"
                />
              </button>

              {/* Profile Dropdown */}
              {isOpen && (
                <div className="absolute right-0 top-14 w-56 bg-white divide-y divide-gray-100 rounded shadow-md dark:bg-gray-700 dark:divide-gray-600">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.username ?? "Guest"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">
                      www.{user?.username ?? "Guest"}.com
                    </p>
                  </div>
                  <ul className="py-1">
                    {[
                      { text: "Profile", href: "/userprofile" },
                      { text: "Sign out", href: "/login" },
                    ].map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mobile Menu */}
              {isMenuOpen && (
                <div className="absolute right-10 top-14 w-48 bg-white divide-y divide-gray-100 rounded shadow-md dark:bg-gray-700 dark:divide-gray-600">
                  <ul className="py-1">
                    <li>
                      <a
                        href="/userprofile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Profile
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
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

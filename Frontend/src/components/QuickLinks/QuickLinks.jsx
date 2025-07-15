"use client"

import { useState } from "react"

export default function QuickLinks() {
  // Sample links data
  const [links, setLinks] = useState([
    { id: 1, name: "Course Catalog", icon: "📚", url: "#", color: "bg-blue-100" },
    { id: 2, name: "Academic Calendar", icon: "📅", url: "#", color: "bg-green-100" },
    { id: 3, name: "Library Resources", icon: "🔍", url: "#", color: "bg-purple-100" },
    { id: 4, name: "Student Support", icon: "🤝", url: "#", color: "bg-amber-100" },
    { id: 5, name: "Career Services", icon: "💼", url: "#", color: "bg-red-100" },
    { id: 6, name: "Campus Map", icon: "🗺️", url: "#", color: "bg-teal-100" },
  ])

  // Track recently used links
  const [recentlyUsed, setRecentlyUsed] = useState([2, 4])

  // Handle link click
  const handleLinkClick = (id) => {
    // Add to recently used if not already there
    if (!recentlyUsed.includes(id)) {
      setRecentlyUsed([id, ...recentlyUsed].slice(0, 3))
    }
  }

  // Filter links by recently used
  const recentLinks = links.filter((link) => recentlyUsed.includes(link.id))

  return (
    <div className="quick-links">
      {/* Recently used section */}
      {recentLinks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recently Used</h3>
          <div className="grid grid-cols-1 gap-2">
            {recentLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                onClick={() => handleLinkClick(link.id)}
                className={`flex items-center p-3 rounded-lg ${link.color} hover:opacity-90 transition-opacity`}
              >
                <span className="text-xl mr-3">{link.icon}</span>
                <span className="text-gray-800 font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* All links */}
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">All Resources</h3>
      <div className="grid grid-cols-1 gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            onClick={() => handleLinkClick(link.id)}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${link.color} mr-3`}>
              <span className="text-lg">{link.icon}</span>
            </div>
            <span className="text-gray-700 font-medium">{link.name}</span>
          </a>
        ))}
      </div>

      {/* Add custom link button */}
      <button className="w-full mt-4 flex items-center justify-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Custom Link
      </button>
    </div>
  )
}

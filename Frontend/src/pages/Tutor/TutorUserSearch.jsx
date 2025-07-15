import React, { useState, useEffect } from 'react';

const TutorUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  
  useEffect(() => {
   
    const fetchData = async () => {
      setLoading(true);
      try {
        
        
        
        const mockUsers = [
          {
            id: 'TE0001',
            name: 'Maneesha Geethanga',
            email: 'Maneesha@gmail.com',
            role: 'Student',
            address: 'Delogoda',
            phone: '771234567',
            department: 'Education',
            joinDate: '2025-03-24',
            status: 'Active',
            profilePhoto: '/api/placeholder/80/80',
            gender: 'M'
          },
          {
            id: 'TE0007',
            name: 'Kasun Kalhara',
            email: 'No email provided',
            role: 'Student',
            address: 'kotmale,sri lanka',
            phone: '1234567894',
            department: 'Education',
            joinDate: '2025-03-25',
            status: 'Active',
            profilePhoto: '/api/placeholder/80/80',
            gender: 'm'
          },
          {
            id: 'TE0008',
            name: 'Sharukh Ramanayake',
            email: 'Maneea@gmail.com',
            role: 'Student',
            address: '123/B',
            phone: '762720230',
            department: 'Education',
            joinDate: '2025-03-25',
            status: 'Active',
            profilePhoto: '/api/placeholder/80/80',
            gender: 'M'
          }
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };
  
   
    fetchData();
  }, []); 


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const field = user[searchBy].toLowerCase();
        return field.includes(value.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  };

  // Handle search field selection
  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
    // Re-apply current search with new field
    if (searchTerm.trim() !== '') {
      const filtered = users.filter(user => {
        const field = user[e.target.value].toLowerCase();
        return field.includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  };

  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="container mx-auto p-4">
      
      {/* Search Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={searchBy} 
              onChange={handleSearchByChange}
              className="w-full p-2 border rounded"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="address">Address</option>
              <option value="department">Department</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List Section */}
        <div className="md:col-span-1 bg-white rounded shadow">
          <h2 className="p-4 border-b font-semibold">User List</h2>
          {loading ? (
            <div className="p-4 text-center">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center">No users found</div>
          ) : (
            <ul className="divide-y">
              {filteredUsers.slice(0,6).map(user => (
                <li 
                  key={user.id} 
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-gray-100' : ''}`}
                >
                  <div className="flex items-center">
                    <img 
                      src='/src/assets/student.png' 
                      alt={`${user.name} profile`} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Details Section */}
        <div className="md:col-span-2 bg-white rounded shadow">
          <h2 className="p-4 border-b font-semibold">User Details</h2>
          {selectedUser ? (
            <div className="p-4">
              <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <img 
                    src='/src/assets/student.png' 
                    alt={`${selectedUser.name} profile`} 
                    className="w-32 h-32 rounded-full"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{selectedUser.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1"><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p className="mb-1"><span className="font-medium">Gender:</span> {selectedUser.gender=="M" ? "Male":"Female"}</p>
                      <p className="mb-1"><span className="font-medium">Department:</span> {selectedUser.department}</p>
                      <p className="mb-1"><span className="font-medium">Status:</span> 
                        <span className={`ml-1 py-1 px-2 rounded-full text-xs ${selectedUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedUser.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="mb-1"><span className="font-medium">Address:</span> {selectedUser.address}</p>
                      <p className="mb-1"><span className="font-medium">Phone:</span> {selectedUser.phone}</p>
                      <p className="mb-1"><span className="font-medium">Join Date:</span> {selectedUser.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-45 grid-row-1 sm:grid-cols-3 lg:ml-40 items-end justify-end space-x-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 m-3">Edit User</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 m-3">Reset Password</button>
                {selectedUser.status === 'Active' ? (
                  <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 m-3">Deactivate</button>
                ) : (
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 m-3">Activate</button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a user to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorUserSearch;
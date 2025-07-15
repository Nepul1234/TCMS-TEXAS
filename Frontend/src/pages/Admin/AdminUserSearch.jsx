import React, { useState, useEffect } from 'react';
import { useModal } from "../../components/hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/Buttons/Button";


const AdminUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    profilePicture: null,
    address: '',
    phoneNumber: '',
    parentPhoneNumber: '',
    school: '',
    city: '',
    province: '',
    email: '',
    id: ''
  });

   const handleChange = (e) => {
    if (e.target.name === 'profile_picture') {
      setFormData({ ...selectedUser, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...selectedUser, [e.target.name]: e.target.value });
      
    }
  };

  useEffect(() => {
          const token = localStorage.getItem("token");
          if (!token) {
              alert("Please login to access this page");
              window.location.href = "/login";
           }
          const verifyToken = async () => {
             try {
                 const res = await fetch('/api/auth/verifyToken', {
                   method: 'POST',
                   headers: {
                      'Authorization': `Bearer ${token}`,
                   },
                });
                   const data = await res.json();
                   if (data.message === "Token expired" || "Invalid token") {
                      alert("Session expired, please login again");
                      window.location.href = "/login";
  
                    }
                } catch (error) {
                   console.log("Message",error,token);
                }
          }
          verifyToken();
       },[]);



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/userData/getAllUserData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        });
        
        const data = await res.json();
        
        const formattedUsers = data.details.map((user, index) => ({
          id: user.userId || `TE${String(index + 1).padStart(4, '0')}`,
          name: user.name || 'No name provided',
          email: user.email || 'No email provided',
          role: user.role || 'Student',
          address: user.address || 'No address provided',
          phone: user.phone || 'No phone provided',
          department: user.department || 'No department provided',
          joinDate: user.joinDate.split('T')[0] || new Date().toISOString().split('T')[0],
          status: user.status || 'Active',
          profilePhotourl: user.role === "student" ? user.profile_picture : `data:image/jpeg;base64,${user.profile_picture}`,
          gender:user.gender,
          dob: user.dob || 'No date of birth provided',
          nic:user.nic || 'No NIC provided',
          province:user.province || 'No province provided',
          city: user.city || 'No city provided',
          school: user.school || 'No school provided',
          qualification: user.role === 'teacher' ? user.qualification : 'N/A',
          parent_telephone: user.role === 'student' ? user.parent_tel_no || 'No parent phone provided' : 'N/A',
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching student data:', error);
        
        
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
  }, []); // Add formData as a dependency if it changes

  const handleDeactivate = async (e) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === selectedUser.id ? { ...user, status: 'Deactivated' } : user
      )
    );
    setFilteredUsers(prevFilteredUsers =>
      prevFilteredUsers.map(user =>
        user.id === selectedUser.id ? { ...user, status: 'Deactivated' } : user
      )
    );
    const userConfirmed = confirm("Do you want to continue?");

    if (userConfirmed) {
        try {
          const res = await fetch('/api/userData/deactivateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: selectedUser.id }),
          });
          if (res.status === 200) {
            Swal.fire({
              title: 'Success!',
              text: 'User deactivated successfully !',
              background: '#f0f4f8',
              color: '#1a202c',
              confirmButtonColor: '#10b981',
              width: '400px',
              customClass: {
              popup: 'rounded-2xl shadow-xl',
              title: 'text-2xl font-bold',
              confirmButton: 'text-white text-lg px-5 py-2',
              },
              backdrop: `
                rgba(0,0,0,0.4)
                left top
                no-repeat `
            });
          } else {
            console.log("User canceled.");
          }
        } catch (error) {
          console.error('Error deactivating user:', error);
        }
        

    }
    closeModal();
  }



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
                      src={user.profilePhotourl || '/src/assets/student.png'} 
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
                    src= {selectedUser.profilePhotourl || '/src/assets/student.png'} 
                    alt={`${selectedUser.name} profile`} 
                    className="w-32 h-32 rounded-full"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{selectedUser.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1"><span className="font-medium">ID:</span> {selectedUser.id}</p>
                      <p className="mb-1"><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p className="mb-1"><span className="font-medium">Gender:</span> {selectedUser.gender=="M" ? "Male":"Female"}</p>
                      <p className="mb-1"><span className="font-medium">Date of Birth:</span> {selectedUser.dob?.split('T')[0]}</p>
                      { selectedUser.role === 'teacher' && (
                        <p className="mb-1"><span className="font-medium">Qualification:</span> {selectedUser.qualification}</p>)}
                      { selectedUser.role === 'student' && (
                        <p className="mb-1"><span className="font-medium">Parent Phone:</span> {selectedUser.parent_telephone}</p>)}
                      <p className="mb-1"><span className="font-medium">NIC:</span> {selectedUser.nic}</p>
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
              
              <div className="mt-45 grid-row-1 sm:grid-cols-1 lg:ml-40 items-center justify-items-center">
                {selectedUser.status === 'Active' ? (
                  <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 m-3" onClick={openModal}>Deactivate</button>
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
      <Modal isOpen={isOpen} className="max-w-[400px] m-4 lg:m-0" onClose={closeModal}>
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <h2 className="text-2xl font-semibold mb-4">Deactivate User</h2>
                    <p className="mb-6">Are you sure you want to deactivate this user?</p>
                    <div className="flex items-center justify-between">
                      <Button onClick={handleDeactivate} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        Deactivate
                      </Button>
                      <Button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">
                        Cancel
                      </Button>
                   
                  </div>
                  </div>
                </div>
              </Modal>
      </div>

    

  

)};

export default AdminUserSearch;
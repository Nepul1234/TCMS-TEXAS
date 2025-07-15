import React, { useState } from "react";
import { Outlet } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({
    teacher_id: "",
    fname: "",
    lname: "",
    email: "",
    address: "",
    Dob: "",
    Gender: "",
    NIC: "",
    tel_no: "",
    qualification: "",
    enroll_date: "",
    password: "",
    profile_picture: null,
    profile_pic: "",
  });
  const [imgUrl, setImgUrl] = useState("");
  
  const temp = localStorage.getItem('user');
  const tempId = temp ? JSON.parse(temp).id : 'ID not found';

  React.useEffect(() => {
    
      const fetchTeacherData = async () => {
      try {
        const res = await fetch("/api/get_tutor_profile_data/get_tutor_profile_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tutor_id: tempId }) 
        });
        
        const data = await res.json();
        
        if (res.status === 200) {
          // Fix: data should be an object, not an array that needs mapping
          if (data) {
            const teacherInfo = data.data;
            setUserData(prev => ({
              ...prev,
              teacher_id: teacherInfo.teacher_id,
              fname: teacherInfo.fname,
              lname: teacherInfo.lname,
              email: teacherInfo.email,
              address: teacherInfo.address,
              Dob: teacherInfo.Dob,
              Gender: teacherInfo.Gender,
              NIC: teacherInfo.NIC,
              tel_no: teacherInfo.tel_no,
              qualification: teacherInfo.qualification,
              enroll_date: teacherInfo.enroll_date,
              profile_pic: teacherInfo.profile_pic
            }));

            
            // Fix: Access profile_pic from the correct source
            if (teacherInfo.profile_pic) {
              const imgurl = `data:image/jpeg;base64,${teacherInfo.profile_pic}`;
              setImgUrl(imgurl);
            } else {
              setImgUrl("https://via.placeholder.com/150");
            }
          } else {
            setImgUrl("https://via.placeholder.com/150");
          }
        } else {
          setError("Failed to fetch teacher data");
          setImgUrl("https://via.placeholder.com/150");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tutors data:", error);
      }
    };
    fetchTeacherData();
  }, [tempId]);
  


  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center">  
            <a href="#" className="flex ms-2 md:me-24">
              <img
                src= "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7vFjF1iF-N_8FpALJMai32zhBUibWruzmFA&s"
                className="h-8 me-3"
                alt="FlowBite Logo"
              />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                Texas Institute
              </span>
            </a>
          </div>

          {/* Right Side - Profile Dropdown */}
          <div className="flex items-center">
            <div className="relative">
              {/* Profile Button */}
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-8 h-8 rounded-full"
                  src={imgUrl || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                  alt="User"
                />
              </button>

              {/* Dropdown Menu (Visible when `isOpen` is true) */}
              {isOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded shadow-md dark:bg-gray-700 dark:divide-gray-600"
                >
                  
                  <ul className="py-1">
                    {[
                      { text: "Dashboard", href: "./" },
                      { text: "My Profile", href: "./my_profile" },
                      { text: "Earnings", href: "./earnings" },
                      { text: "Sign out", href: "./login" },
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
            </div>
          </div>
        </div>
      </div>
    </nav>
    
  );
}

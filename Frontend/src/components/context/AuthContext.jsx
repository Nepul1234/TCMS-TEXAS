import { createContext, useContext, useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const userData = JSON.parse(atob(token.split('.')[1]));
    setUser(userData); 
    localStorage.setItem("user", JSON.stringify(userData)); 
    if(userData.role === 'admin')
      navigate("/admin"); 
    if(userData.role === 'super_admin')
      navigate("/superdash");
    if(userData.role === 'student')
      navigate("/student");
    if(userData.role === 'teacher')
      navigate("/tutor");
  };


  const logout = () => {
    const userConfirmed = confirm("Do you want to logout?");
    if (userConfirmed) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login"); 
   } else {
       // User clicked "Cancel" (No)
       console.log("User canceled.");
        return;
    }
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

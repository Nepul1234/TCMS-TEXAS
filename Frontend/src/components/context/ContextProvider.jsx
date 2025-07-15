import { createContext, useState, useContext } from "react";

// Create the context
const UserContext = createContext();

// Custom hook for easier usage
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

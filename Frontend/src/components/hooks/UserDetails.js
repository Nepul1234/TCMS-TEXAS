import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useUserDetails() {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    const role = user?.role;
  
    useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUserDetails = async () => {
    try {
      if(role === "admin"){ 
      const res = await fetch("/api/profileData/adminProfileData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({id:userId}), // Use user_id instead of user.id
      });
      
        const result = await res.json();
        const data = result.data;
        setUserDetails({
              id: data.id,
              fname: data.Fname, 
              lname: data.Lname,
              email: data.Email, 
              phone: data.Tel_no,
              address: data.Address,
              country: data.country || "N/A",
              postal_code: data.postal_code || "N/A",
              taxId: data.taxId || "N/A"
            });
            const image = data.profile_picture;
            const imageUrl = `data:image/jpeg;base64,${image}`;
            setImageUrl(imageUrl);

      }
      if(role === "super_admin"){
        const res = await fetch("/api/profileData/getSuperAdminData", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({id:userId}), // Use user_id instead of user.id
          });
  
          const result = await res.json();
          const data = result.data;
            setUserDetails({
              id: data.id,
              fname: data.Fname, 
              lname: data.Lname,
              email: data.Email, 
              phone: data.Tel_no,
              address: data.Address,
              country: data.country || "N/A",
              postal_code: data.postal_code || "N/A",
              taxId: data.taxId || "N/A"
            });
            const image = data.profile_picture;
            const imageUrl = `data:image/jpeg;base64,${image}`;
            setImageUrl(imageUrl);
          
          }

  
      
    } catch (error) {
      console.error("Error fetching admin profile data:", error);
    } finally {
      setLoading(false);
    }
  };
        fetchUserDetails();
    }, []);
    
    return { userDetails, imageUrl };
    }
// Usage example in a component
// import { useUserDetails } from '../components/hooks/UserDetails';
// const { userDetails, loading, error } = useUserDetails();
// if (loading) return <div>Loading...</div>;
// if (error) return <div>Error: {error}</div>;
// return <div>User: {userDetails.name}</div>;
// This hook can be used in any component to fetch and manage user details globally.
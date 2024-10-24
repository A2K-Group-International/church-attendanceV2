import React, { createContext, useState, useContext, useEffect } from "react";
import supabase from "../api/supabase"; // Adjust the import as needed

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to track loading
  const [loggedIn, setLoggedIn] = useState(false); // State to track logged-in status

  // Effect to fetch user data only once after login
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(); // Get current user from Supabase
      if (user) {
        const { data: userDetails, error: userError } = await supabase
          .from("user_list")
          .select("*")
          .eq("user_uuid", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError.message);
        } else {
          setUserData(userDetails); // Save user data in context
          setLoggedIn(true); // Set logged-in state to true
        }
      }
      setLoading(false); // Stop loading
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <UserContext.Provider
      value={{ userData, setUserData, loading, loggedIn, setLoggedIn }}
    >
      {loading ? <p>Loading user data...</p> : children}{" "}
      {/* Show loading state */}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

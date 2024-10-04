// src/hooks/useUserData.js
import { useEffect, useState } from "react";
import supabase from "./supabase";
import { useUser } from "../authentication/useUser";

const useUserData = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_list")
          .select("*")
          .eq("user_uuid", user.id)
          .single();

        if (error) throw error;

        setUserData(data);
      } catch (err) {
        setError("Error fetching user data. Please try again.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, loading, error };
};

export default useUserData;

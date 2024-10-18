// api/useAnnouncements.js
import { useState, useEffect, useCallback } from "react";
import supabase from "./supabase";

const useAnnouncements = (groupId) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch announcements
      const { data: announcementsData, error: announcementsError } =
        await supabase
          .from("post_data")
          .select("*")
          .eq("post_group_id", groupId)
          .order("created_at", { ascending: false });

      if (announcementsError) throw announcementsError;

      setAnnouncements(announcementsData);
    } catch (err) {
      setError("Error fetching announcements. Please try again.");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
      console.log("External fetch completed!");
    }
  }, [groupId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, error, fetchAnnouncements };
};

export default useAnnouncements;

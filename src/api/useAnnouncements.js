import { useState, useEffect, useCallback } from "react";
import supabase from "./supabase";

const useAnnouncements = (groupId, visibility) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(groupId, visibility);

    try {
      // Start the query for announcements
      let query = supabase.from("post_data").select("*");

      // Check visibility and filter accordingly
      if (visibility === "public") {
        query = query.eq("public", true);
      }

      // Filter by groupId if specified
      if (groupId) {
        query = query.eq("post_group_id", groupId);
      }

      const { data: announcementsData, error: announcementsError } =
        await query.order("created_at", { ascending: false });

      if (announcementsError) throw announcementsError;

      setAnnouncements(announcementsData);
    } catch (err) {
      setError("Error fetching announcements. Please try again.");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
      console.log("External fetch completed!");
    }
  }, [groupId, visibility]); // Add visibility as a dependency

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, error, fetchAnnouncements };
};

export default useAnnouncements;

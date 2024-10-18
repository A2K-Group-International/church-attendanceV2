// useReactions.js
import { useState, useEffect, useCallback } from "react";
import supabase from "./supabase";

const useReactions = (postId, userId) => {
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null); // State to store the user's specific reaction
  const [loading, setLoading] = useState(true);

  const fetchReactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reactions")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;

      // Calculate reaction counts
      const reactionCounts = data.reduce((counts, reaction) => {
        counts[reaction.reaction_type] =
          (counts[reaction.reaction_type] || 0) + 1;

        // Check if this reaction belongs to the current user
        if (reaction.user_id === userId) {
          setUserReaction(reaction.reaction_type); // Set the user's reaction if found
        }

        return counts;
      }, {});

      setReactions(reactionCounts);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, userId]); // Include userId in the dependency array

  useEffect(() => {
    // Fetch reactions when postId changes
    if (postId) {
      fetchReactions();
    }

    return () => {
      setLoading(false); // Cleanup
    };
  }, [postId, fetchReactions]); // Include fetchReactions in dependency array

  return { reactions, userReaction, loading, fetchReactions }; // Return userReaction as well
};

export default useReactions; // Ensure this export is present

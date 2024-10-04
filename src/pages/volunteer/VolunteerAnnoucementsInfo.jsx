// src/pages/VolunteerAnnouncementsInfo.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import { Button } from "../../shadcn/button";
import Spinner from "../../components/Spinner";
import { format } from "date-fns";
import { useUser } from "../../authentication/useUser";
import useUserData from "../../api/userUserData"; // Import your custom hook

export default function VolunteerAnnouncementsInfo() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const { userData, loading: userLoading, error: userError } = useUserData(); // Use custom hook for user data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(""); // Error state for comment input
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  const fetchPostDetails = useCallback(async () => {
    if (!userData) return; // Exit if userData is not available

    try {
      const { data: postData, error: postError } = await supabase
        .from("post_data")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (postError) throw postError;

      setPost(postData);

      const { data: groupData, error: groupError } = await supabase
        .from("group_list")
        .select("*")
        .eq("group_id", postData.post_group_id)
        .single();

      if (groupError) throw groupError;

      setGroupData(groupData);

      const { data: commentsData, error: commentsError } = await supabase
        .from("comment_data")
        .select("*, user_list(user_name, user_last_name)")
        .eq("post_id", postId);

      if (commentsError) throw commentsError;

      setComments(commentsData);
    } catch (err) {
      setError("Failed to load post details. Please try again.");
      console.error("Error fetching post details:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, userData]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    setSuccessMessage(""); // Reset success message

    if (!newComment.trim()) {
      setCommentError("Comment cannot be blank.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: commentError } = await supabase
        .from("comment_data")
        .insert([
          {
            user_id: userData.user_id, // Use userData from the hook
            post_id: postId,
            comment_content: newComment,
          },
        ]);

      if (commentError) throw commentError;

      // Set success message after successful submission
      setSuccessMessage("Comment added successfully!");

      fetchPostDetails();
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/volunteer-announcements");
  };

  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  if (loading || userLoading) {
    return (
      <VolunteerSidebar>
        <main className="flex justify-center">
          <Spinner />
        </main>
      </VolunteerSidebar>
    );
  }

  if (error) {
    return (
      <VolunteerSidebar>
        <main className="flex flex-col items-center justify-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Button onClick={handleBack}>Back to Announcements</Button>
        </main>
      </VolunteerSidebar>
    );
  }

  return (
    <VolunteerSidebar>
      <main className="flex justify-center">
        <div className="w-full max-w-2xl space-y-6 p-4 lg:p-8">
          <Button onClick={handleBack} className="mb-4">
            Back to Announcements
          </Button>

          <div className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-start">
              <div className="mr-4 flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                  {getInitials(
                    `${userData?.user_name} ${userData?.user_last_name}`,
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {userData
                      ? `${userData.user_name} ${userData.user_last_name}`
                      : "Unknown User"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(post.created_at), "MMM dd, yyyy")}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {post.post_content}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Comments:</h3>
              <div className="mb-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.comment_id} className="border-b py-2">
                      <div className="flex items-start">
                        <div className="mr-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                            {getInitials(
                              `${comment.user_list.user_name} ${comment.user_list.user_last_name}`,
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold">
                            {`${comment.user_list.user_name} ${comment.user_list.user_last_name}`}
                          </span>
                          <p className="text-gray-500">
                            {comment.comment_content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet...</p>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex flex-col">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="mb-2 rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                {commentError && <p className="text-red-500">{commentError}</p>}
                {successMessage && (
                  <p className="text-green-500">{successMessage}</p> // Display success message
                )}
                <Button
                  type="submit"
                  className="self-end"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="small" /> : "Post Comment"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </VolunteerSidebar>
  );
}

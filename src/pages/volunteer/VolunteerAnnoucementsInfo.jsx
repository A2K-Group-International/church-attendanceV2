// src/pages/VolunteerAnnouncementsInfo.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import { Button } from "../../shadcn/button";
import Spinner from "../../components/Spinner";
import { useUser } from "../../authentication/useUser";
import useUserData from "../../api/useUserData";
import PostDetails from "../../components/volunteer/post/PostDetails";
import CommentsSection from "../../components/volunteer/post/CommentsSection";

export default function VolunteerAnnouncementsInfo() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const { userData, loading: userLoading } = useUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPostDetails = useCallback(async () => {
    if (!userData) return;

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
    setSuccessMessage("");

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
            user_id: userData.user_id,
            post_id: postId,
            comment_content: newComment,
          },
        ]);

      if (commentError) throw commentError;

      setSuccessMessage("Comment added successfully!");

      fetchPostDetails();
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError("Failed to add comment. Please try again.");
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

          {/* Post Details */}
          <PostDetails
            post={post}
            userData={userData}
            getInitials={getInitials}
          />

          {/* Comments Section */}
          <CommentsSection
            comments={comments}
            getInitials={getInitials}
            newComment={newComment}
            setNewComment={setNewComment}
            handleCommentSubmit={handleCommentSubmit}
            commentError={commentError}
            successMessage={successMessage}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </VolunteerSidebar>
  );
}

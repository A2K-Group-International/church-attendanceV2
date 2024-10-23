// src/components/volunteer/PostDetails.jsx

import React from "react";
import { format } from "date-fns";
import Reactions from "./Reactions"; // Import the Reactions component
import { Separator } from "../../../shadcn/separator"; // Import the Separator component
import PropTypes from "prop-types";
import useReactions from "@/api/useReactions";

const PostDetails = ({ post, userData, getInitials, handleReaction }) => {
  // to be added
  // const { reactions, loading, fetchReactions, userReaction } = useReactions(
  //   post.post_id,
  //   userId,
  // ); // Destructure reactions and loading
  // console.log(reactions);
  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      {/* Post Header */}
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        {post.post_header}
      </h2>

      {/* Post Content */}
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        {post.post_content}
      </p>

      {/* Post Image */}
      {post.uploaded_image && (
        <img
          src={post.uploaded_image}
          alt={post.post_header}
          className="mb-4 h-48 w-full rounded-lg object-cover"
        />
      )}

      {/* Separator */}
      <Separator className="my-4" />

      {/* User and Date Information */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="mr-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            {getInitials(`${userData?.user_name} ${userData?.user_last_name}`)}
          </div>
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {`${userData?.user_name} ${userData?.user_last_name}`}
          </span>
          <span className="ml-2">
            {format(new Date(post.created_at), "PP")}
          </span>
        </div>
      </div>
      {/* <Separator className="my-4" /> */}

      {/* Reactions */}
      {/* <Reactions postId={post.post_id} handleReaction={handleReaction} /> */}
    </div>
  );
};

PostDetails.propTypes = {
  post: PropTypes.shape({
    created_at: PropTypes.string.isRequired,
    post_header: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    post_id: PropTypes.number.isRequired,
    uploaded_image: PropTypes.string, // Use uploaded_image prop for the image
  }).isRequired,
  userData: PropTypes.shape({
    user_name: PropTypes.string.isRequired,
    user_last_name: PropTypes.string.isRequired,
  }).isRequired,
  getInitials: PropTypes.func.isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default PostDetails;

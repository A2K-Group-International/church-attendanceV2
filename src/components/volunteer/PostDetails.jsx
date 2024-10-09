// src/components/volunteer/PostDetails.jsx

import React from "react";
import { format } from "date-fns";
import Reactions from "./Reactions"; // Import the Reactions component
import PropTypes from "prop-types";

const PostDetails = ({ post, userData, getInitials, handleReaction }) => {
  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-center">
        <div className="mr-4 flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
            {getInitials(`${userData?.user_name} ${userData?.user_last_name}`)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {userData
                ? `${userData.user_name} ${userData.user_last_name}`
                : "Unknown User"}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(post.created_at), "MMM dd, yyyy hh:mm a")}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {post.post_header}
      </div>

      <p className="text-gray-700 dark:text-gray-300">{post.post_content}</p>

      {/* Reactions */}
      <Reactions postId={post.post_id} handleReaction={handleReaction} />
    </div>
  );
};

PostDetails.propTypes = {
  post: PropTypes.shape({
    created_at: PropTypes.string.isRequired,
    post_header: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    post_id: PropTypes.number.isRequired,
  }).isRequired,
  userData: PropTypes.shape({
    user_name: PropTypes.string.isRequired,
    user_last_name: PropTypes.string.isRequired,
  }),
  getInitials: PropTypes.func.isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default PostDetails;

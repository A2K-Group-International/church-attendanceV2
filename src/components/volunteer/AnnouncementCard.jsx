// src/components/volunteer/AnnouncementCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import Reactions from "./Reactions"; // Import the Reactions component
import PropTypes from "prop-types";

const AnnouncementCard = ({ post, handleReaction }) => {
  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex flex-col">
        <div className="flex items-center">
          <div className="mr-4 flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
              {getInitials(`${post.user_name}`)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {post.user_name}
              </span>
              <span className="text-sm text-gray-500">
                {format(new Date(post.created_at), "PP")}
              </span>
            </div>
          </div>
        </div>
        <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {post.post_header}
        </h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {post.post_content}
        </p>
      </div>

      {/* Reactions */}
      <Reactions postId={post.post_id} handleReaction={handleReaction} />

      {/* Read More Link */}
      <Link
        to={`/volunteer-announcements-info/${post.post_id}`}
        className="mt-4 text-blue-500 hover:underline"
      >
        Read more
      </Link>
    </div>
  );
};

AnnouncementCard.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.number.isRequired,
    user_name: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    post_header: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    // Add other fields as necessary
  }).isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default AnnouncementCard;

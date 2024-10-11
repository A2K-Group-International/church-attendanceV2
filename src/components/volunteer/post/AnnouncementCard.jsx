import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FaThumbsUp, FaHeart, FaStar } from "react-icons/fa";
import { Separator } from "../../../shadcn/separator";
import PropTypes from "prop-types";

const AnnouncementCard = ({ post, handleReaction }) => {
  const [selectedReaction, setSelectedReaction] = useState(null); // Local state for selected reaction

  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  const handleIconClick = (reaction) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null); // Deselect if already selected
    } else {
      setSelectedReaction(reaction); // Select the new reaction
      handleReaction(post.post_id, reaction); // Call the reaction handler
    }
  };

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
      {/* Separator */}
      <Separator className="my-4" />
      {/* User and Date Information */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="mr-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            {getInitials(post.user_name)}
          </div>
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {post.user_name}
          </span>
          <span className="ml-2">
            {format(new Date(post.created_at), "PP")}
          </span>
        </div>
      </div>
      <Separator className="my-4" />
      {/* Reaction Icons */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <FaThumbsUp
            className={`cursor-pointer ${selectedReaction === "like" ? "text-blue-500" : "text-gray-400"}`}
            size={24}
            onClick={() => handleIconClick("like")}
          />
          <FaHeart
            className={`cursor-pointer ${selectedReaction === "love" ? "text-red-500" : "text-gray-400"}`}
            size={24}
            onClick={() => handleIconClick("love")}
          />
          <FaStar
            className={`cursor-pointer ${selectedReaction === "celebrate" ? "text-yellow-500" : "text-gray-400"}`}
            size={24}
            onClick={() => handleIconClick("celebrate")}
          />
        </div>

        {/* Read More Link */}
        <Link
          to={`/volunteer-announcements-info/${post.post_id}`}
          className="text-blue-500 hover:underline"
        >
          Read more
        </Link>
      </div>
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
  }).isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default AnnouncementCard;

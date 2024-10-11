import React, { useState } from "react";
import { FaThumbsUp, FaHeart, FaStar } from "react-icons/fa"; // Import desired icons
import PropTypes from "prop-types";

const Reactions = ({ postId, handleReaction }) => {
  const [selectedReaction, setSelectedReaction] = useState(null); // Track the selected reaction

  const handleClick = (reactionType) => {
    setSelectedReaction(reactionType); // Update selected reaction
    handleReaction(postId, reactionType); // Call the parent handler
  };

  return (
    <div className="mt-4 flex space-x-6">
      <button
        onClick={() => handleClick("like")}
        className="flex items-center focus:outline-none"
        aria-label="Like this announcement"
      >
        <FaThumbsUp
          className={`mr-1 ${selectedReaction === "like" ? "text-blue-500" : "text-gray-400"}`}
          size={24}
        />
      </button>
      <button
        onClick={() => handleClick("love")}
        className="flex items-center focus:outline-none"
        aria-label="Love this announcement"
      >
        <FaHeart
          className={`mr-1 ${selectedReaction === "love" ? "text-red-500" : "text-gray-400"}`}
          size={24}
        />
      </button>
      <button
        onClick={() => handleClick("celebrate")}
        className="flex items-center focus:outline-none"
        aria-label="Celebrate this announcement"
      >
        <FaStar
          className={`mr-1 ${selectedReaction === "celebrate" ? "text-yellow-500" : "text-gray-400"}`}
          size={24}
        />
      </button>
    </div>
  );
};

Reactions.propTypes = {
  postId: PropTypes.number.isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default Reactions;

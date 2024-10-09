// src/components/volunteer/Reactions.jsx

import React from "react";
import { FaThumbsUp, FaThumbsDown, FaHeart } from "react-icons/fa"; // Import desired icons
import PropTypes from "prop-types";

const Reactions = ({ postId, handleReaction }) => {
  return (
    <div className="mt-4 flex space-x-6">
      <button
        onClick={() => handleReaction("agree")}
        className="flex items-center text-gray-600 hover:text-blue-500 focus:outline-none"
        aria-label="Agree with this announcement"
      >
        <FaThumbsUp className="mr-1" />
        <span>Agree</span>
      </button>
      <button
        onClick={() => handleReaction("disagree")}
        className="flex items-center text-gray-600 hover:text-red-500 focus:outline-none"
        aria-label="Disagree with this announcement"
      >
        <FaThumbsDown className="mr-1" />
        <span>Disagree</span>
      </button>
      <button
        onClick={() => handleReaction("love")}
        className="flex items-center text-gray-600 hover:text-pink-500 focus:outline-none"
        aria-label="Love this announcement"
      >
        <FaHeart className="mr-1" />
        <span>Love</span>
      </button>
    </div>
  );
};

Reactions.propTypes = {
  postId: PropTypes.number.isRequired,
  handleReaction: PropTypes.func.isRequired,
};

export default Reactions;

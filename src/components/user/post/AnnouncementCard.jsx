import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FaThumbsUp, FaHeart, FaStar, FaEllipsisV } from "react-icons/fa";
import { Separator } from "../../../shadcn/separator";
import useReactions from "@/api/useReactions";

import PropTypes from "prop-types";
import useUserData from "@/api/useUserData";

const ConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Confirm Deletion</h2>
        <p>Are you sure you want to delete this announcement?</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="mr-2 text-gray-600">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AnnouncementCard = ({
  post,
  handleReaction,

  userId,
}) => {
  const { reactions, loading, fetchReactions, userReaction } = useReactions(
    post.post_id,
    userId,
  ); // Destructure reactions and loading

  const skeletonStyle = "w-6 h-4 bg-gray-300 animate-pulse rounded";

  // Remove this line

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Toggle menu open/close state
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector(".menu");
      if (menu && !menu.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  const handleIconClick = async (reaction) => {
    const newReaction = userReaction === reaction ? null : reaction; // Use userReaction instead

    try {
      await handleReaction(post.post_id, newReaction);
      await fetchReactions(); // Fetch reactions again to get updated counts
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const renderPostContent = (content) => {
    return content.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const confirmDelete = () => {
    onDelete(post.post_id);
    setIsDeleteDialogOpen(false); // Close the dialog after deletion
  };

  // Handle closing the image modal when clicking outside
  const handleCloseImageModal = (event) => {
    if (event.target === event.currentTarget) {
      setIsImageModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      {/* Post Header */}
      {/* Group Name */}
      {post.group_name && (
        <p className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
          {post.group_name}
        </p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          {post.post_header}
        </h2>

        {post.post_user_id === userId && ( // Check if the current user is the post owner
          <div className="relative ml-2">
            {menuOpen && (
              <div className="menu absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
                <button
                  onClick={() => {
                    onEdit(post.post_id);
                    setMenuOpen(false); // Close menu after action
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsDeleteDialogOpen(true); // Open confirmation dialog
                    setMenuOpen(false); // Close menu after action
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Post Content */}
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        {renderPostContent(post.post_content)}
      </p>
      {/* Image Section */}
      {post.uploaded_image && (
        <div className="relative mb-4 h-48 w-full overflow-hidden">
          <img
            src={post.uploaded_image}
            alt="Post"
            className="h-full w-full cursor-pointer object-cover"
            onClick={() => setIsImageModalOpen(true)} // Open modal on image click
          />
        </div>
      )}
      {/* Edited Tag */}
      {post.edited && (
        <p className="mb-4 text-sm italic text-gray-500 dark:text-gray-400">
          This post was edited.
        </p>
      )}
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
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <FaThumbsUp
              className={`cursor-pointer ${userReaction === "like" ? "text-blue-500" : "text-gray-400"}`}
              size={24}
              onClick={() => handleIconClick("like")}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {loading ? (
                <div className={skeletonStyle}></div>
              ) : (
                reactions?.like || 0
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <FaHeart
              className={`cursor-pointer ${userReaction === "love" ? "text-red-500" : "text-gray-400"}`}
              size={24}
              onClick={() => handleIconClick("love")}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {loading ? (
                <div className={skeletonStyle}></div>
              ) : (
                reactions?.love || 0
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <FaStar
              className={`cursor-pointer ${userReaction === "celebrate" ? "text-yellow-500" : "text-gray-400"}`}
              size={24}
              onClick={() => handleIconClick("celebrate")}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {loading ? (
                <div className={skeletonStyle}></div>
              ) : (
                reactions?.celebrate || 0
              )}
            </span>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseImageModal} // Close on clicking outside
        >
          <div className="relative rounded bg-white p-4">
            <img
              src={post.uploaded_image}
              alt="Full View"
              className="max-h-[90vh] max-w-[90vw] rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

AnnouncementCard.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.number.isRequired,
    user_name: PropTypes.string.isRequired,
    post_user_id: PropTypes.number.isRequired,
    created_at: PropTypes.string.isRequired,
    post_header: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    uploaded_image: PropTypes.string, // Add uploaded_image to PropTypes
    edited: PropTypes.bool.isRequired, // Add edited to PropTypes
  }).isRequired,
  handleReaction: PropTypes.func.isRequired,

  userId: PropTypes.number.isRequired,
};

export default AnnouncementCard;

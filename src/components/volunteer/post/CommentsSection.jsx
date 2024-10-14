// src/components/volunteer/CommentsSection.jsx

import React from "react";
import PropTypes from "prop-types";
import Comment from "./Comment";
import { Button } from "../../../shadcn/button";
import Spinner from "../../../components/Spinner";

const CommentsSection = ({
  comments,
  getInitials,
  newComment,
  setNewComment,
  handleCommentSubmit,
  commentError,
  successMessage,
  isSubmitting,
}) => {
  return (
    <div className="mt-4">
      <h3 className="mb-2 font-semibold">Comments:</h3>
      <div className="mb-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.comment_id}
              comment={comment}
              getInitials={getInitials}
            />
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
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <Button type="submit" className="self-end" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="small" /> : "Post Comment"}
        </Button>
      </form>
    </div>
  );
};

CommentsSection.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      comment_id: PropTypes.number.isRequired,
      comment_content: PropTypes.string.isRequired,
      user_list: PropTypes.shape({
        user_name: PropTypes.string.isRequired,
        user_last_name: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  getInitials: PropTypes.func.isRequired,
  newComment: PropTypes.string.isRequired,
  setNewComment: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired,
  commentError: PropTypes.string,
  successMessage: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired,
};

export default CommentsSection;

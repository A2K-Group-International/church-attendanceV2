// src/components/volunteer/Comment.jsx

import React from "react";
import PropTypes from "prop-types";

const Comment = ({ comment, getInitials }) => {
  return (
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
          <div className="flex flex-col">
            <span className="font-semibold">
              {`${comment.user_list.user_name} ${comment.user_list.user_last_name}`}
            </span>
            <p className="text-gray-500">{comment.comment_content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.shape({
    comment_id: PropTypes.number.isRequired,
    comment_content: PropTypes.string.isRequired,
    user_list: PropTypes.shape({
      user_name: PropTypes.string.isRequired,
      user_last_name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  getInitials: PropTypes.func.isRequired,
};

export default Comment;

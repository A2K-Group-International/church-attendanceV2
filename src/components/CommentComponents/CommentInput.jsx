import useUserData from "@/api/useUserData";
import useComment from "@/hooks/useComment";
import { Button } from "@/shadcn/button";
import { Textarea } from "@/shadcn/textarea";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function CommentInput({ post_id }) {
  const { register, handleSubmit,reset } = useForm();
  const { userData } = useUserData();
  const [isCommenting, setIsCommenting] = useState(false);

  const { HandleAddComment } = useComment(reset);

//   console.log("postid",post_id)

  return (
    <div className="flex-grow">
      <form
        onSubmit={handleSubmit((data) =>
          HandleAddComment({ data, user_id: userData.user_id, post_id }),
        )}
        id="comment"
        className="flex-1"
      >
        <Textarea
          {...register("comment", { required: true })}
          onFocus={() => setIsCommenting(true)}
          name="comment"
          placeholder="Write Your Comment Here"
        />
      </form>

      {isCommenting && (
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => setIsCommenting(false)}
            variant={"ghost"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="comment"
            className="bg-orange-400 hover:bg-orange-500"
          >
            Comment
          </Button>
        </div>
      )}
    </div>
  );
}

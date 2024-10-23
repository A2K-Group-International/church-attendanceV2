
import useUserData from "@/api/useUserData";
import { useToast } from "@/shadcn/use-toast";
import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Textarea } from "@/shadcn/textarea";
import { Button } from "@/shadcn/button";
import { Separator } from "@/shadcn/separator";
import { useState } from "react";
import CommentInput from "./CommentComponents/CommentInput";

export default function Comments({post_id}) {


  const { userData } = useUserData();

  const { toast } = useToast();

  const Initial = getInitial(userData?.user_name);


  return (
    <div className="p-1">
      <h1 className="mb-2 text-md font-bold"> {0} Comments</h1>
      <div className="flex w-full items-start justify-center gap-3">
        <Avatar>
          <AvatarImage
            className="h-8 w-8 rounded-full"
            src={""}
            alt="@shadcn"
          />
          <AvatarFallback className="items-centerjustify-center flex h-8 w-8 rounded-full bg-green-600">
            {Initial}
          </AvatarFallback>
        </Avatar>
       <CommentInput post_id={post_id}/>
         </div>
      <Separator className="my-3" />
      {/* {comments.map((item, index) => (
        <CommentDetails key={index} courseId={courseId} comment={item} />
      ))} */}
    </div>
  );
}

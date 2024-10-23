import { addComment } from "@/api/commentsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";

export default function useComment(reset) {
  const { toast } = useToast();

  const queryClient = useQueryClient()

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Added.",
      });
      reset();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const HandleAddComment = ({data, user_id, post_id}) => {

    console.log("inputs",data.comment,user_id,post_id)
    
    addCommentMutation.mutate({comment:data.comment, user_id, post_id});
  };

  return { HandleAddComment };
}

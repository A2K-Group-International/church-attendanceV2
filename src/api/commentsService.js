import supabase from "@/api/supabase";

export const addComment = async ({ comment, user_id, post_id }) => {
  console.log("inputs", comment, user_id, post_id);
  
  if (!user_id || !post_id) {
    throw new Error("User ID and Post ID are required!");
  }
  
  const { error } = await supabase
    .from("comment_data")
    .insert([{ comment_content: comment, user_id: user_id, post_id: post_id }]);

  if (error) {
    console.error("Supabase error:", error); // Log the error for debugging
    throw new Error(error.message || "Unknown Error.");
  }
};

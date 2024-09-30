import supabase from "../api/supabase";
import { login as loginApi } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutateAsync: login,
    isLoading,
    isError,
  } = useMutation({
    mutationFn: async ({ email, password }) => {
      const { user } = await loginApi({ email, password });
      return user;
    },
    onSuccess: async (user) => {
      queryClient.setQueriesData([user], user);

      const { data: userData, error } = await supabase
        .from("user_list")
        .select("*") // Fetch all fields
        .eq("user_uuid", user.id)
        .single();

      if (error || !userData) {
        console.error(error?.message || "Could not fetch user data");
        return;
      }

      // Save the entire userData object in the cache
      queryClient.setQueriesData(["userData", user.id], userData); // Use a unique key

      // Check user_role and navigate accordingly
      if (userData.user_role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userData.user_role === "user") {
        navigate("/events-page", { replace: true });
      } else if (userData.user_role === "volunteer") {
        navigate("/volunteer-dashboard", { replace: true });
      }
    },
    onError: (err) => {
      console.log("Login error", err.message);
    },
  });

  return { login, isLoading, isError };
}

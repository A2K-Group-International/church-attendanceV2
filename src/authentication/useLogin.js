import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../api/supabase";
import { login as loginApi } from "../api/authService";
import { useUser } from "@/context/UserContext";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUserData, setLoggedIn } = useUser(); // Access setUserData and setLoggedIn from UserContext

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
      setUserData(null); // Clear any previous user data on new login

      // Fetch user details
      const { data: userData, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.id)
        .single();

      if (error || !userData) {
        console.error(error?.message || "Could not fetch user data");
        return;
      }

      // Set user data and loggedIn state in context
      setUserData(userData);
      setLoggedIn(true); // Set loggedIn state to true

      // Navigate based on user role
      if (userData.user_role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userData.user_role === "user") {
        navigate("/events-page", { replace: true });
      } else if (userData.user_role === "volunteer") {
        navigate("/volunteer-announcements", { replace: true });
      }
    },
    onError: (err) => {
      console.log("Login error", err.message);
    },
  });

  return { login, isLoading, isError };
}

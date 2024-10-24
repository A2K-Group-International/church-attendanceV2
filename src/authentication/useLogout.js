import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/authService";
import { useUser } from "@/context/UserContext"; // Import the context to update loggedIn state

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserData, setLoggedIn } = useUser(); // Access setUserData and setLoggedIn from UserContext

  const { mutate: logout, isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries(); // Clear any cached data
      setUserData(null); // Clear user data in context
      setLoggedIn(false); // Set loggedIn state to false
      navigate("/", { replace: true }); // Redirect to the home or login page
    },
  });

  return { logout, isLoading };
}

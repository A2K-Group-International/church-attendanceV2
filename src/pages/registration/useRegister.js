// useRegister.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUp } from "../../api/authService"; // Import the signUp function directly

export function useRegister({ onSuccess }) {
  const queryClient = useQueryClient();

  const {
    mutate: registerUser,
    isLoading,
    isError,
    error: errorMessage, // Capture the error message
  } = useMutation({
    mutationFn: ({ firstName, lastName, email, password, contactNumber }) =>
      signUp({ firstName, lastName, email, password, contactNumber }), // Call signUp directly
    onSuccess: () => {
      queryClient.invalidateQueries(["account_pending"]); // Invalidate or refetch as necessary
      if (onSuccess) onSuccess(); // Call the onSuccess callback if provided
    },
    onError: (err) => {
      console.error(err);
    },
  });

  return { registerUser, isLoading, isError, errorMessage }; // Return error message for usage in the component
}

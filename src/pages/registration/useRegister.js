import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAccount as requestAccountApi } from "../../api/authService";

export function useRegister({ onSuccess }) {
  const queryClient = useQueryClient();

  const {
    mutate: requestAccount,
    isLoading,
    isError,
    error: errorMessage, // Capture the error message
  } = useMutation({
    mutationFn: (
      { name, email, password, contactNumber }, // Accept contactNumber
    ) => requestAccountApi({ name, email, password, contactNumber }), // Pass contactNumber to API
    onSuccess: () => {
      queryClient.invalidateQueries(["account_pending"]); // Invalidate or refetch as necessary
      if (onSuccess) onSuccess(); // Call the onSuccess callback if provided
    },
    onError: (err) => {
      console.error(err);
    },
  });

  return { requestAccount, isLoading, isError, errorMessage }; // Return error message for usage in the component
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./useUser";
import Spinner from "../components/Spinner";

export default function ProtectedRouted({ children }) {
  const navigate = useNavigate();
  //Load the authenticated user
  const { isLoading, isAuthenticated } = useUser();

  //redirect if it's not authenticated
  useEffect(
    function () {
      if (!isAuthenticated && !isLoading) {
        navigate("/");
      }
    },
    [isAuthenticated, isLoading, navigate],
  );

  //While loading
  if (isLoading)
    return (
        <Spinner />
    );

  if (isAuthenticated) return children;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { UserProvider } from "./context/UserContext.jsx";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Create a root for React 18+
const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {" "}
        {/* Wrap App with UserProvider */}
        <App />
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
);

import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
// Using the components index file for cleaner imports
import { ProjectDetails } from "./components";
import { EditProjectPage } from "./components/EditProjectPage";

// Helper function to get the Convex URL with proper validation
function getConvexUrl(): string {
  // Use production URL if available and we're in production mode
  if (import.meta.env.PROD && import.meta.env.PROD_CONVEX_URL) {
    return import.meta.env.PROD_CONVEX_URL;
  }

  // Use development URL in development mode
  if (import.meta.env.VITE_CONVEX_URL) {
    return import.meta.env.VITE_CONVEX_URL;
  }

  // Provide a clear error message when neither environment variable is set
  if (import.meta.env.PROD) {
    throw new Error(
      "Missing PROD_CONVEX_URL environment variable. " +
      "Please set PROD_CONVEX_URL in your environment variables for production builds."
    );
  } else {
    throw new Error(
      "Missing VITE_CONVEX_URL environment variable. " +
      "Please set VITE_CONVEX_URL in your .env file for development. " +
      "Example: VITE_CONVEX_URL=http://localhost:3001"
    );
  }
}

// Get the Convex URL with proper validation
const convexUrl = getConvexUrl();

const convex = new ConvexReactClient(convexUrl);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/project/:projectId",
    element: <ProjectDetails />,
  },
  {
    path: "/project/:projectId/edit",
    element: <EditProjectPage />,
  },
  {
    path: "/invite/:token",
    element: <App />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <RouterProvider router={router} />
  </ConvexAuthProvider>,
);
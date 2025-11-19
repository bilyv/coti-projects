import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
// Using the components index file for cleaner imports
import { ProjectDetails } from "./components";
import { EditProjectPage } from "./components/EditProjectPage";

// Use production URL if available and we're in production mode, otherwise use the development URL
const convexUrl = import.meta.env.PROD && import.meta.env.PROD_CONVEX_URL 
  ? import.meta.env.PROD_CONVEX_URL 
  : import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl as string);

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
]);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <RouterProvider router={router} />
  </ConvexAuthProvider>,
);
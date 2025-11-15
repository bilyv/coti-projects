import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

// Use production URL if available and we're in production mode, otherwise use the development URL
const convexUrl = import.meta.env.PROD && import.meta.env.PROD_CONVEX_URL 
  ? import.meta.env.PROD_CONVEX_URL 
  : import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
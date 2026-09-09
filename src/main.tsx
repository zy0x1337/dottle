import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// iOS Safari: block page pinch-zoom so it never fights the canvas gestures
const block = (e: Event) => e.preventDefault();
document.addEventListener("gesturestart", block, { passive: false });
document.addEventListener("gesturechange", block, { passive: false });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

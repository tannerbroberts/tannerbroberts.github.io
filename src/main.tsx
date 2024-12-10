import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <h1>React app in the building</h1>
  </StrictMode>,
);

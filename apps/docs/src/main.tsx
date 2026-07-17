import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import App from "./App";
import "./styles/docs.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

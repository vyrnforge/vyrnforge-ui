import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@dravyn/ui-data-grid/style.css";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
import App from "./App";
import "./styles/playground.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

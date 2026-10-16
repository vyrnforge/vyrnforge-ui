import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import App from "./App";
import "./styles/docs.css";
import "./styles/examples.css";
import "./styles/icon-reference.css";
import "./styles/documentation-app-shell.css";
import "./styles/documentation-content-frame.css";
import "./styles/reference-navigation.css";
import "./styles/reference-shell.css";
import "./styles/component-reference.css";
import "./styles/reference-responsive.css";
import "./styles/content-pages.css";
import "./styles/reference-ui.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

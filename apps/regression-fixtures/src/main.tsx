import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
import "./styles.css";
import { FixtureApp } from "./FixtureApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <FixtureApp />
  </StrictMode>,
);

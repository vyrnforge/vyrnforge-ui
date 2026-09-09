import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  Button,
  Dialog,
  Tabs,
  TextInput,
  type TabItem,
} from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";

import "./styles.css";

const tabs: TabItem[] = [
  {
    id: "summary",
    label: "Summary",
    content: "React public package Tabs",
  },
  {
    id: "events",
    label: "Events",
    content: "Controlled React public package state",
  },
];

function App() {
  const actionRef = useRef<HTMLButtonElement>(null);
  const ownerRef = useRef<HTMLInputElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [owner, setOwner] = useState("Operations");
  const [status, setStatus] = useState("Waiting");

  useEffect(() => {
    const actionHost = actionRef.current?.parentElement;
    const ownerHost = ownerRef.current?.parentElement;

    actionHost?.setAttribute("data-vf-generated-button", "react");
    ownerHost?.setAttribute("name", "owner");
  }, []);

  return (
    <main
      className="vf-consumer-react"
      data-consumer-ready="true"
      data-react-consumer
    >
      <h1>React packed consumer</h1>
      <p>This fixture consumes only the first-class React public package.</p>

      <Button
        ref={actionRef}
        variant="primary"
        onClick={() => {
          setStatus("Action: react-save");
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-consumer-action", "received");
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-generated-button-action", "received");
        }}
      >
        Save from React
      </Button>

      <Tabs
        aria-label="React consumer sections"
        items={tabs}
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-generated-tabs-value", value);
        }}
      />

      <TextInput
        ref={ownerRef}
        aria-label="Owner"
        name="owner"
        value={owner}
        onChange={(event) => {
          setOwner(event.currentTarget.value);
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute(
              "data-generated-text-input-value",
              event.currentTarget.value,
            );
        }}
      />

      <button
        ref={dialogTriggerRef}
        data-react-dialog-trigger
        type="button"
        onClick={() => setDialogOpen(true)}
      >
        Open React dialog
      </button>
      <Dialog
        className="react-public-dialog"
        description="First-class React Dialog runtime evidence"
        open={dialogOpen}
        title="React public dialog"
        onOpenChange={(open) => {
          setDialogOpen(open);
          const root = document.querySelector("[data-react-consumer]");
          root?.setAttribute("data-generated-dialog-open", String(open));
          if (!open) {
            root?.setAttribute("data-generated-dialog-dismiss", "escape-key");
          }
        }}
        onUnmountAutoFocus={(event) => {
          event.preventDefault();
          dialogTriggerRef.current?.focus();
        }}
      >
        <button type="button" data-dialog-first>
          First dialog action
        </button>
        <button type="button" data-dialog-last>
          Last dialog action
        </button>
      </Dialog>

      <output aria-live="polite" data-consumer-status>
        {status}
      </output>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

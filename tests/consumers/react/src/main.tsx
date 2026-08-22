import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";

import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

type ButtonElement = VyrnForgeElementForTagName<"vf-button">;
type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

import { GeneratedButton } from "./generated/Button.generated";
import { GeneratedTabs } from "./generated/Tabs.generated";
import { GeneratedTextInput } from "./generated/TextInput.generated";

import "./styles.css";

function App() {
  const actionRef = useRef<ButtonElement>(null);
  const tabsRef = useRef<TabsElement>(null);
  const ownerRef = useRef<TextInputElement>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [owner, setOwner] = useState("Operations");
  const [status, setStatus] = useState("Waiting");

  const tabs = useMemo(
    () =>
      [
        {
          id: "summary",
          label: "Summary",
          content: "React generated Tabs facade",
        },
        {
          id: "events",
          label: "Events",
          content: "Controlled value and typed DOM event listener",
        },
      ] satisfies readonly VyrnForgeTabItem[],
    [],
  );

  useEffect(() => {
    const action = actionRef.current;
    if (!action) return;

    const handleAction = (event: CustomEvent<VyrnForgeActionDetail>) => {
      setStatus(
        `Action: ${event.detail.action ?? "react-save"} (${event.detail.reason})`,
      );
      document
        .querySelector("[data-react-consumer]")
        ?.setAttribute("data-consumer-action", "received");
    };

    action.addEventListener("vf-action", handleAction);
    return () => action.removeEventListener("vf-action", handleAction);
  }, []);

  useEffect(() => {
    const tabsElement = tabsRef.current;
    const ownerElement = ownerRef.current;

    if (!tabsElement || !ownerElement) {
      throw new Error("React did not attach the Custom Element refs.");
    }

    const assignedItems = tabsElement.items;
    const itemsMatch =
      assignedItems.length === tabs.length &&
      assignedItems.every((item, index) => {
        const expected = tabs[index];
        return (
          expected !== undefined &&
          item.id === expected.id &&
          item.label === expected.label &&
          item.content === expected.content
        );
      });

    if (!itemsMatch) {
      throw new Error(
        "Generated React Tabs did not assign the items property.",
      );
    }

    if (tabsElement.hasAttribute("items")) {
      throw new Error(
        "Generated React Tabs serialized the items property into an attribute.",
      );
    }

    if (tabsElement.value !== activeTab) {
      throw new Error(
        "Generated React Tabs did not retain controlled value.",
      );
    }

    if (ownerElement.value !== owner) {
      throw new Error(
        "React did not assign the generated text input value property.",
      );
    }

    document
      .querySelector("[data-react-consumer]")
      ?.setAttribute("data-consumer-ready", "true");
  }, [activeTab, owner, tabs]);

  return (
    <main className="vf-consumer-react" data-react-consumer>
      <vf-inline-message title="React consumer ready" variant="success">
        React is consuming packed VyrnForge Custom Elements directly.
      </vf-inline-message>

      <GeneratedButton
        ref={actionRef}
        action="react-save"
        variant="primary"
        onClick={(detail) => {
          if (detail.action !== "react-save") {
            throw new Error(
              "Generated React Button action mapping is invalid.",
            );
          }
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-generated-button-action", "received");
        }}
      >
        Save from React
      </GeneratedButton>

      <GeneratedTabs
        ref={tabsRef}
        ariaLabel="React consumer sections"
        items={tabs}
        value={activeTab}
        activationMode="automatic"
        onValueChange={(value) => {
          setActiveTab(value);
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-generated-tabs-value", value);
        }}
      />

      <GeneratedTextInput
        ref={ownerRef}
        label="Owner"
        name="owner"
        value={owner}
        onValueChange={(value) => {
          setOwner(value);
          document
            .querySelector("[data-react-consumer]")
            ?.setAttribute("data-generated-text-input-value", value);
        }}
      />

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

import "../architecture-probe";
import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

import { bindGeneratedVfButton } from "./generated/vf-button.generated";
import { bindGeneratedVfTextInput } from "./generated/vf-text-input.generated";

import "./styles.css";

const root = document.querySelector<HTMLElement>("[data-consumer-root]");
const status = document.querySelector<HTMLElement>("[data-consumer-status]");
const save =
  document.querySelector<VyrnForgeElementForTagName<"vf-button">>(
    "#native-save",
  );
const tabs =
  document.querySelector<VyrnForgeElementForTagName<"vf-tabs">>("#native-tabs");
const owner =
  document.querySelector<VyrnForgeElementForTagName<"vf-text-input">>(
    'vf-text-input[name="owner"]',
  );
const form = document.querySelector<HTMLFormElement>("#native-form");

if (!root || !status || !save || !tabs || !owner || !form) {
  throw new Error("Native HTML consumer fixture markup is incomplete.");
}

tabs.items = [
  {
    id: "summary",
    label: "Summary",
    content: "Packed native HTML consumer",
  },
  {
    id: "activity",
    label: "Activity",
    content: "Canonical events and property assignment",
  },
] satisfies readonly VyrnForgeTabItem[];

bindGeneratedVfButton(save, {
  action: "save",
  variant: "primary",
  onAction: (detail) => {
    if (detail.action !== "save") {
      throw new Error("Generated Native Button action mapping is invalid.");
    }
    root.dataset.generatedButtonAction = "received";
  },
});

bindGeneratedVfTextInput(owner, {
  name: "owner",
  value: "Operations",
  required: true,
  label: "Owner",
  onValueChange: (value) => {
    root.dataset.generatedTextInputValue = value;
  },
});

save.addEventListener("vf-action", (event) => {
  const detail: VyrnForgeActionDetail = event.detail;
  status.textContent = `Action: ${detail.action ?? "save"} (${detail.reason})`;
  status.dataset.consumerAction = "received";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  status.textContent = `Submitted owner: ${String(formData.get("owner"))}`;
  status.dataset.consumerForm = "submitted";
});

const createdButton = document.createElement("vf-button");
createdButton.variant = "subtle";
createdButton.action = "created-with-tag-map";
createdButton.textContent = "Typed DOM creation";
createdButton.dataset.consumerCreated = "true";
root.append(createdButton);

root.dataset.consumerReady = "true";

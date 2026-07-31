import type {
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

const tabs = document.createElement("vf-tabs");
const typedTabs: VyrnForgeElementForTagName<"vf-tabs"> = tabs;
typedTabs.items = [] satisfies readonly VyrnForgeTabItem[];

const action = document.createElement("vf-button");
action.addEventListener("vf-action", (event) => {
  const reason: string = event.detail.reason;
  void reason;
});

const owner = document.createElement("vf-text-input");
owner.addEventListener("vf-value-change", (event) => {
  const value: unknown = event.detail.value;
  void value;
});

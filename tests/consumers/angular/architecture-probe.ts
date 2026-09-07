import {
  VfAutocompleteSlotNames,
  VfDialogSlotNames,
  VfPageHeaderSlotNames,
  composeVfAutocompleteSlot,
  composeVfDialogSlot,
  composeVfPageHeaderSlot,
  type VfAutocompleteSlotName,
  type VfDialogSlotName,
  type VfPageHeaderSlotName,
} from "@vyrnforge/ui-angular";
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

const autocompleteSlots = [
  "label",
  "description",
  "prefix",
  "suffix",
  "empty",
  "loading",
  "item",
] satisfies readonly VfAutocompleteSlotName[];
const dialogSlots = ["trigger", "content"] satisfies readonly VfDialogSlotName[];
const pageHeaderSlots = ["status", "actions"] satisfies readonly VfPageHeaderSlotName[];

for (const slot of autocompleteSlots) {
  composeVfAutocompleteSlot(document.createElement("span"), slot);
}
for (const slot of dialogSlots) {
  composeVfDialogSlot(document.createElement("span"), slot);
}
for (const slot of pageHeaderSlots) {
  composeVfPageHeaderSlot(document.createElement("span"), slot);
}

void VfAutocompleteSlotNames;
void VfDialogSlotNames;
void VfPageHeaderSlotNames;

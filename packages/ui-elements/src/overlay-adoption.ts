import type { OverlayPlacement } from "@vyrnforge/ui-behaviors";

export type VyrnForgeOverlayAdoptionId =
  | "autocomplete"
  | "confirm-dialog"
  | "dialog"
  | "drawer"
  | "popover"
  | "toast"
  | "tooltip";

export type VyrnForgeOverlayCapability =
  | "anchored-placement"
  | "controlled-open"
  | "custom-filter"
  | "custom-render"
  | "focus-containment"
  | "focus-restoration"
  | "portal-target"
  | "rich-content"
  | "toast-lifecycle"
  | "trigger-ownership";

export interface VyrnForgeOverlayRegionContract {
  readonly name: string;
  readonly className: string;
  readonly required?: boolean;
}

export interface VyrnForgeOverlayAdoptionContract {
  readonly id: VyrnForgeOverlayAdoptionId;
  readonly capabilities: readonly VyrnForgeOverlayCapability[];
  readonly defaultPlacement?: OverlayPlacement;
  readonly regions: readonly VyrnForgeOverlayRegionContract[];
}

function contract(
  value: VyrnForgeOverlayAdoptionContract,
): VyrnForgeOverlayAdoptionContract {
  return Object.freeze({
    ...value,
    capabilities: Object.freeze([...value.capabilities]),
    regions: Object.freeze(
      value.regions.map((region) => Object.freeze({ ...region })),
    ),
  });
}

export const vyrnForgeOverlayAdoptionContracts = Object.freeze({
  dialog: contract({
    id: "dialog",
    capabilities: [
      "controlled-open",
      "focus-containment",
      "focus-restoration",
      "portal-target",
      "rich-content",
    ],
    regions: [
      { name: "content", className: "vf-dialog__content", required: true },
      { name: "header", className: "vf-dialog__header" },
      { name: "body", className: "vf-dialog__body", required: true },
      { name: "footer", className: "vf-dialog__footer" },
    ],
  }),
  drawer: contract({
    id: "drawer",
    capabilities: [
      "controlled-open",
      "focus-containment",
      "focus-restoration",
      "portal-target",
      "rich-content",
    ],
    regions: [
      { name: "content", className: "vf-drawer__content", required: true },
      { name: "header", className: "vf-drawer__header" },
      { name: "body", className: "vf-drawer__body", required: true },
      { name: "footer", className: "vf-drawer__footer" },
    ],
  }),
  popover: contract({
    id: "popover",
    capabilities: [
      "anchored-placement",
      "controlled-open",
      "focus-restoration",
      "portal-target",
      "rich-content",
      "trigger-ownership",
    ],
    defaultPlacement: "bottom-start",
    regions: [
      { name: "content", className: "vf-popover__content", required: true },
    ],
  }),
  tooltip: contract({
    id: "tooltip",
    capabilities: [
      "anchored-placement",
      "controlled-open",
      "portal-target",
      "rich-content",
      "trigger-ownership",
    ],
    defaultPlacement: "top",
    regions: [{ name: "content", className: "vf-tooltip", required: true }],
  }),
  toast: contract({
    id: "toast",
    capabilities: ["portal-target", "rich-content", "toast-lifecycle"],
    regions: [
      { name: "content", className: "vf-toast__content", required: true },
      { name: "title", className: "vf-toast__title" },
      { name: "description", className: "vf-toast__description" },
      { name: "action", className: "vf-toast__action" },
    ],
  }),
  "confirm-dialog": contract({
    id: "confirm-dialog",
    capabilities: [
      "controlled-open",
      "focus-containment",
      "focus-restoration",
      "portal-target",
      "rich-content",
    ],
    regions: [
      { name: "body", className: "vf-confirm-dialog__body", required: true },
      { name: "actions", className: "vf-confirm-dialog__actions", required: true },
    ],
  }),
  autocomplete: contract({
    id: "autocomplete",
    capabilities: [
      "anchored-placement",
      "controlled-open",
      "custom-filter",
      "custom-render",
      "focus-restoration",
      "portal-target",
      "rich-content",
    ],
    defaultPlacement: "bottom-start",
    regions: [
      { name: "control", className: "vf-autocomplete__control", required: true },
      { name: "layer", className: "vf-autocomplete__layer", required: true },
      {
        name: "option",
        className: "vf-autocomplete__option-main",
        required: true,
      },
      { name: "label", className: "vf-autocomplete__option-label" },
      {
        name: "description",
        className: "vf-autocomplete__option-description",
      },
      { name: "status", className: "vf-autocomplete__status" },
    ],
  }),
});

export function findVyrnForgeOverlayRegion(
  adoption: VyrnForgeOverlayAdoptionContract,
  name: string,
): VyrnForgeOverlayRegionContract | undefined {
  return adoption.regions.find((region) => region.name === name);
}

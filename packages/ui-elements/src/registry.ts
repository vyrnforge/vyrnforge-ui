import {
  VyrnForgeAppShellElement,
  VyrnForgeAutocompleteElement,
  VyrnForgeBadgeElement,
  VyrnForgeBreadcrumbsElement,
  VyrnForgeButtonElement,
  VyrnForgeButtonGroupElement,
  VyrnForgeConfirmDialogElement,
  VyrnForgeCaptionElement,
  VyrnForgeCardElement,
  VyrnForgeCheckboxElement,
  VyrnForgeCodeTextElement,
  VyrnForgeDateInputElement,
  VyrnForgeDateTimeInputElement,
  VyrnForgeDialogElement,
  VyrnForgeDrawerElement,
  VyrnForgeEmptyStateElement,
  VyrnForgeErrorStateElement,
  VyrnForgeFieldElement,
  VyrnForgeHeadingElement,
  VyrnForgeIconButtonElement,
  VyrnForgeInlineElement,
  VyrnForgeLabelElement,
  VyrnForgeLoadingStateElement,
  VyrnForgeMenuElement,
  VyrnForgeMultiSelectElement,
  VyrnForgeNumberInputElement,
  VyrnForgePageElement,
  VyrnForgePageHeaderElement,
  VyrnForgePageToolbarElement,
  VyrnForgePanelElement,
  VyrnForgePopoverElement,
  VyrnForgeRadioElement,
  VyrnForgeRadioGroupElement,
  VyrnForgeRatingElement,
  VyrnForgeSearchInputElement,
  VyrnForgeSectionElement,
  VyrnForgeSegmentedControlElement,
  VyrnForgeSelectElement,
  VyrnForgeSideNavElement,
  VyrnForgeSliderElement,
  VyrnForgeStackElement,
  VyrnForgeSwitchElement,
  VyrnForgeTabsElement,
  VyrnForgeTextElement,
  VyrnForgeToastElement,
  VyrnForgeToastViewportElement,
  VyrnForgeTooltipElement,
  VyrnForgeTransferListElement,
  VyrnForgeTextInputElement,
  VyrnForgeTextareaElement,
  VyrnForgeToggleButtonElement,
  VyrnForgeToggleButtonGroupElement,
  VyrnForgeToolbarButtonElement,
  VyrnForgeValidationMessageElement,
} from "./components";

export type VyrnForgeElementTagName = `vf-${string}`;
export type VyrnForgeElementConstructor = CustomElementConstructor;

export interface VyrnForgeElementDefinition {
  readonly tagName: VyrnForgeElementTagName;
  readonly constructor: VyrnForgeElementConstructor;
}

export interface VyrnForgeElementRegistry {
  define(name: string, constructor: VyrnForgeElementConstructor): void;
  get(name: string): VyrnForgeElementConstructor | undefined;
}

export type VyrnForgeElementRegistration = (
  registry?: VyrnForgeElementRegistry,
) => boolean;

const TAG_PATTERN = /^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const vyrnForgeElementDefinitions: readonly VyrnForgeElementDefinition[] =
  Object.freeze([
    Object.freeze({ tagName: "vf-text", constructor: VyrnForgeTextElement }),
    Object.freeze({
      tagName: "vf-heading",
      constructor: VyrnForgeHeadingElement,
    }),
    Object.freeze({
      tagName: "vf-caption",
      constructor: VyrnForgeCaptionElement,
    }),
    Object.freeze({ tagName: "vf-label", constructor: VyrnForgeLabelElement }),
    Object.freeze({
      tagName: "vf-code-text",
      constructor: VyrnForgeCodeTextElement,
    }),
    Object.freeze({ tagName: "vf-badge", constructor: VyrnForgeBadgeElement }),
    Object.freeze({ tagName: "vf-card", constructor: VyrnForgeCardElement }),
    Object.freeze({ tagName: "vf-panel", constructor: VyrnForgePanelElement }),
    Object.freeze({ tagName: "vf-stack", constructor: VyrnForgeStackElement }),
    Object.freeze({
      tagName: "vf-inline",
      constructor: VyrnForgeInlineElement,
    }),
    Object.freeze({ tagName: "vf-page", constructor: VyrnForgePageElement }),
    Object.freeze({
      tagName: "vf-section",
      constructor: VyrnForgeSectionElement,
    }),
    Object.freeze({
      tagName: "vf-empty-state",
      constructor: VyrnForgeEmptyStateElement,
    }),
    Object.freeze({
      tagName: "vf-loading-state",
      constructor: VyrnForgeLoadingStateElement,
    }),
    Object.freeze({
      tagName: "vf-error-state",
      constructor: VyrnForgeErrorStateElement,
    }),
    Object.freeze({
      tagName: "vf-button",
      constructor: VyrnForgeButtonElement,
    }),
    Object.freeze({
      tagName: "vf-icon-button",
      constructor: VyrnForgeIconButtonElement,
    }),
    Object.freeze({
      tagName: "vf-button-group",
      constructor: VyrnForgeButtonGroupElement,
    }),
    Object.freeze({
      tagName: "vf-toolbar-button",
      constructor: VyrnForgeToolbarButtonElement,
    }),
    Object.freeze({
      tagName: "vf-text-input",
      constructor: VyrnForgeTextInputElement,
    }),
    Object.freeze({
      tagName: "vf-textarea",
      constructor: VyrnForgeTextareaElement,
    }),
    Object.freeze({
      tagName: "vf-search-input",
      constructor: VyrnForgeSearchInputElement,
    }),
    Object.freeze({
      tagName: "vf-number-input",
      constructor: VyrnForgeNumberInputElement,
    }),
    Object.freeze({
      tagName: "vf-date-input",
      constructor: VyrnForgeDateInputElement,
    }),
    Object.freeze({
      tagName: "vf-datetime-input",
      constructor: VyrnForgeDateTimeInputElement,
    }),
    Object.freeze({
      tagName: "vf-checkbox",
      constructor: VyrnForgeCheckboxElement,
    }),
    Object.freeze({ tagName: "vf-radio", constructor: VyrnForgeRadioElement }),
    Object.freeze({
      tagName: "vf-radio-group",
      constructor: VyrnForgeRadioGroupElement,
    }),
    Object.freeze({
      tagName: "vf-switch",
      constructor: VyrnForgeSwitchElement,
    }),
    Object.freeze({
      tagName: "vf-select",
      constructor: VyrnForgeSelectElement,
    }),
    Object.freeze({
      tagName: "vf-slider",
      constructor: VyrnForgeSliderElement,
    }),
    Object.freeze({
      tagName: "vf-rating",
      constructor: VyrnForgeRatingElement,
    }),
    Object.freeze({
      tagName: "vf-toggle-button",
      constructor: VyrnForgeToggleButtonElement,
    }),
    Object.freeze({
      tagName: "vf-toggle-button-group",
      constructor: VyrnForgeToggleButtonGroupElement,
    }),
    Object.freeze({
      tagName: "vf-segmented-control",
      constructor: VyrnForgeSegmentedControlElement,
    }),
    Object.freeze({ tagName: "vf-field", constructor: VyrnForgeFieldElement }),
    Object.freeze({
      tagName: "vf-validation-message",
      constructor: VyrnForgeValidationMessageElement,
    }),
    Object.freeze({ tagName: "vf-tabs", constructor: VyrnForgeTabsElement }),
    Object.freeze({
      tagName: "vf-breadcrumbs",
      constructor: VyrnForgeBreadcrumbsElement,
    }),
    Object.freeze({
      tagName: "vf-side-nav",
      constructor: VyrnForgeSideNavElement,
    }),
    Object.freeze({
      tagName: "vf-autocomplete",
      constructor: VyrnForgeAutocompleteElement,
    }),
    Object.freeze({
      tagName: "vf-multi-select",
      constructor: VyrnForgeMultiSelectElement,
    }),
    Object.freeze({
      tagName: "vf-transfer-list",
      constructor: VyrnForgeTransferListElement,
    }),
    Object.freeze({
      tagName: "vf-dialog",
      constructor: VyrnForgeDialogElement,
    }),
    Object.freeze({
      tagName: "vf-drawer",
      constructor: VyrnForgeDrawerElement,
    }),
    Object.freeze({
      tagName: "vf-popover",
      constructor: VyrnForgePopoverElement,
    }),
    Object.freeze({ tagName: "vf-menu", constructor: VyrnForgeMenuElement }),
    Object.freeze({
      tagName: "vf-tooltip",
      constructor: VyrnForgeTooltipElement,
    }),
    Object.freeze({ tagName: "vf-toast", constructor: VyrnForgeToastElement }),
    Object.freeze({
      tagName: "vf-toast-viewport",
      constructor: VyrnForgeToastViewportElement,
    }),
    Object.freeze({
      tagName: "vf-confirm-dialog",
      constructor: VyrnForgeConfirmDialogElement,
    }),
    Object.freeze({
      tagName: "vf-app-shell",
      constructor: VyrnForgeAppShellElement,
    }),
    Object.freeze({
      tagName: "vf-page-header",
      constructor: VyrnForgePageHeaderElement,
    }),
    Object.freeze({
      tagName: "vf-page-toolbar",
      constructor: VyrnForgePageToolbarElement,
    }),
  ]);

export const vyrnForgeElementRegistrations: Readonly<
  Record<VyrnForgeElementTagName, VyrnForgeElementRegistration>
> = Object.freeze(
  Object.fromEntries(
    vyrnForgeElementDefinitions.map((definition) => [
      definition.tagName,
      createVyrnForgeElementRegistration(definition),
    ]),
  ) as Record<VyrnForgeElementTagName, VyrnForgeElementRegistration>,
);

export function getVyrnForgeElementRegistry():
  VyrnForgeElementRegistry | undefined {
  return globalThis.customElements;
}

export function assertVyrnForgeElementTagName(
  tagName: string,
): asserts tagName is VyrnForgeElementTagName {
  if (!TAG_PATTERN.test(tagName)) {
    throw new TypeError(`Invalid VyrnForge element tag: ${tagName}`);
  }
}

export function defineVyrnForgeElement(
  tagName: VyrnForgeElementTagName,
  constructor: VyrnForgeElementConstructor,
  registry = getVyrnForgeElementRegistry(),
): boolean {
  assertVyrnForgeElementTagName(tagName);
  if (!registry || registry.get(tagName)) return false;
  registry.define(tagName, constructor);
  return true;
}

export function registerVyrnForgeElement(
  definition: VyrnForgeElementDefinition,
  registry = getVyrnForgeElementRegistry(),
): boolean {
  return defineVyrnForgeElement(
    definition.tagName,
    definition.constructor,
    registry,
  );
}

export function createVyrnForgeElementRegistration(
  definition: VyrnForgeElementDefinition,
): VyrnForgeElementRegistration {
  assertVyrnForgeElementTagName(definition.tagName);
  return (registry = getVyrnForgeElementRegistry()) =>
    registerVyrnForgeElement(definition, registry);
}

export function registerVyrnForgeElementDefinitions(
  definitions: readonly VyrnForgeElementDefinition[],
  registry = getVyrnForgeElementRegistry(),
): readonly VyrnForgeElementTagName[] {
  if (!registry) return Object.freeze([]);

  const registered: VyrnForgeElementTagName[] = [];
  for (const definition of definitions) {
    if (registerVyrnForgeElement(definition, registry)) {
      registered.push(definition.tagName);
    }
  }
  return Object.freeze(registered);
}

export function registerVyrnForgeElements(
  registry = getVyrnForgeElementRegistry(),
): readonly VyrnForgeElementTagName[] {
  return registerVyrnForgeElementDefinitions(
    vyrnForgeElementDefinitions,
    registry,
  );
}

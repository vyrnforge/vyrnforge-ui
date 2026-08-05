type VyrnForgeComponentConstructors = typeof import("./components");

type VyrnForgeElementInstance<
  TName extends keyof VyrnForgeComponentConstructors,
> = VyrnForgeComponentConstructors[TName] extends abstract new (
  ...args: never[]
) => infer TElement
  ? TElement
  : never;

/**
 * Public Custom Element tag-to-instance map for typed DOM consumers.
 *
 * Importing `@vyrnforge/ui-elements` installs this declaration only;
 * registration remains explicit through `registerVyrnForgeElements` or
 * `@vyrnforge/ui-elements/register`.
 */
export interface VyrnForgeHTMLElementTagNameMap {
  "vf-text": VyrnForgeElementInstance<"VyrnForgeTextElement">;
  "vf-heading": VyrnForgeElementInstance<"VyrnForgeHeadingElement">;
  "vf-caption": VyrnForgeElementInstance<"VyrnForgeCaptionElement">;
  "vf-label": VyrnForgeElementInstance<"VyrnForgeLabelElement">;
  "vf-code-text": VyrnForgeElementInstance<"VyrnForgeCodeTextElement">;
  "vf-icon": VyrnForgeElementInstance<"VyrnForgeIconElement">;
  "vf-badge": VyrnForgeElementInstance<"VyrnForgeBadgeElement">;
  "vf-card": VyrnForgeElementInstance<"VyrnForgeCardElement">;
  "vf-panel": VyrnForgeElementInstance<"VyrnForgePanelElement">;
  "vf-stack": VyrnForgeElementInstance<"VyrnForgeStackElement">;
  "vf-inline": VyrnForgeElementInstance<"VyrnForgeInlineElement">;
  "vf-page": VyrnForgeElementInstance<"VyrnForgePageElement">;
  "vf-section": VyrnForgeElementInstance<"VyrnForgeSectionElement">;
  "vf-empty-state": VyrnForgeElementInstance<"VyrnForgeEmptyStateElement">;
  "vf-loading-state": VyrnForgeElementInstance<"VyrnForgeLoadingStateElement">;
  "vf-error-state": VyrnForgeElementInstance<"VyrnForgeErrorStateElement">;
  "vf-inline-message": VyrnForgeElementInstance<"VyrnForgeInlineMessageElement">;
  "vf-skeleton": VyrnForgeElementInstance<"VyrnForgeSkeletonElement">;
  "vf-button": VyrnForgeElementInstance<"VyrnForgeButtonElement">;
  "vf-icon-button": VyrnForgeElementInstance<"VyrnForgeIconButtonElement">;
  "vf-button-group": VyrnForgeElementInstance<"VyrnForgeButtonGroupElement">;
  "vf-toolbar-button": VyrnForgeElementInstance<"VyrnForgeToolbarButtonElement">;
  "vf-text-input": VyrnForgeElementInstance<"VyrnForgeTextInputElement">;
  "vf-textarea": VyrnForgeElementInstance<"VyrnForgeTextareaElement">;
  "vf-search-input": VyrnForgeElementInstance<"VyrnForgeSearchInputElement">;
  "vf-number-input": VyrnForgeElementInstance<"VyrnForgeNumberInputElement">;
  "vf-date-input": VyrnForgeElementInstance<"VyrnForgeDateInputElement">;
  "vf-datetime-input": VyrnForgeElementInstance<"VyrnForgeDateTimeInputElement">;
  "vf-checkbox": VyrnForgeElementInstance<"VyrnForgeCheckboxElement">;
  "vf-radio": VyrnForgeElementInstance<"VyrnForgeRadioElement">;
  "vf-radio-group": VyrnForgeElementInstance<"VyrnForgeRadioGroupElement">;
  "vf-switch": VyrnForgeElementInstance<"VyrnForgeSwitchElement">;
  "vf-select": VyrnForgeElementInstance<"VyrnForgeSelectElement">;
  "vf-slider": VyrnForgeElementInstance<"VyrnForgeSliderElement">;
  "vf-rating": VyrnForgeElementInstance<"VyrnForgeRatingElement">;
  "vf-toggle-button": VyrnForgeElementInstance<"VyrnForgeToggleButtonElement">;
  "vf-toggle-button-group": VyrnForgeElementInstance<"VyrnForgeToggleButtonGroupElement">;
  "vf-segmented-control": VyrnForgeElementInstance<"VyrnForgeSegmentedControlElement">;
  "vf-field": VyrnForgeElementInstance<"VyrnForgeFieldElement">;
  "vf-validation-message": VyrnForgeElementInstance<"VyrnForgeValidationMessageElement">;
  "vf-tabs": VyrnForgeElementInstance<"VyrnForgeTabsElement">;
  "vf-breadcrumbs": VyrnForgeElementInstance<"VyrnForgeBreadcrumbsElement">;
  "vf-side-nav": VyrnForgeElementInstance<"VyrnForgeSideNavElement">;
  "vf-autocomplete": VyrnForgeElementInstance<"VyrnForgeAutocompleteElement">;
  "vf-multi-select": VyrnForgeElementInstance<"VyrnForgeMultiSelectElement">;
  "vf-transfer-list": VyrnForgeElementInstance<"VyrnForgeTransferListElement">;
  "vf-dialog": VyrnForgeElementInstance<"VyrnForgeDialogElement">;
  "vf-drawer": VyrnForgeElementInstance<"VyrnForgeDrawerElement">;
  "vf-popover": VyrnForgeElementInstance<"VyrnForgePopoverElement">;
  "vf-menu": VyrnForgeElementInstance<"VyrnForgeMenuElement">;
  "vf-tooltip": VyrnForgeElementInstance<"VyrnForgeTooltipElement">;
  "vf-toast": VyrnForgeElementInstance<"VyrnForgeToastElement">;
  "vf-toast-viewport": VyrnForgeElementInstance<"VyrnForgeToastViewportElement">;
  "vf-confirm-dialog": VyrnForgeElementInstance<"VyrnForgeConfirmDialogElement">;
  "vf-app-shell": VyrnForgeElementInstance<"VyrnForgeAppShellElement">;
  "vf-page-header": VyrnForgeElementInstance<"VyrnForgePageHeaderElement">;
  "vf-page-toolbar": VyrnForgeElementInstance<"VyrnForgePageToolbarElement">;
  "vf-top-nav": VyrnForgeElementInstance<"VyrnForgeTopNavElement">;
}

export type VyrnForgePublicElementTagName =
  keyof VyrnForgeHTMLElementTagNameMap;

export type VyrnForgeElementForTagName<
  TTagName extends VyrnForgePublicElementTagName,
> = VyrnForgeHTMLElementTagNameMap[TTagName];

declare global {
  interface HTMLElementTagNameMap extends VyrnForgeHTMLElementTagNameMap {}
}

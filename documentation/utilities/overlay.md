# Overlay utility

Overlay is a shared usage and customization topic, not a public `Overlay` component or an application-wide overlay manager. Use VyrnForge's public Popover, Tooltip, PreviewCard, Dialog, AlertDialog, or Drawer for their distinct interaction contracts. Each component retains its own API, behavior, and accessibility documentation.

## Choose the appropriate surface

- Popover: interactive contextual content anchored to an explicit trigger, with native auto-popover dismissal.
- Tooltip: brief supplementary description on hover or keyboard focus, without interactive tasks.
- PreviewCard: a richer contextual preview on hover or focus; do not treat it as a modal dialog.
- Dialog and AlertDialog: modal decisions in native dialog top layer; AlertDialog has a stronger action/dismissal policy.
- Drawer: modal content attached to a logical or physical viewport edge, implemented on the Dialog foundation.

## Positioning and viewport fit

Anchored surfaces use browser-native CSS Anchor Positioning and a shared placement vocabulary. Each component retains its own default placement and viewport fallback policy. Logical start and end adapt to writing direction. Inspect placement at narrow widths and enlarged text; fallback positions may differ from your preferred value.

## Appearance and customization

The canonical visual system lives in `@vyrnforge/web`, not documentation CSS or a framework-specific stylesheet. Load the public stylesheet for the chosen component. Configure themes and semantic tokens in your application scope; use CSS custom properties such as `--vf-shadow-popover` to override supported anchored-surface elevation. Choose shared `--vf-shadow-sm`, `--vf-shadow-md`, or `--vf-shadow-lg` values rather than hard-coded shadow colors. Do not rely on the unmerged proposal for Popover's default shadow as shipped behavior.

## Top layer, backdrop, and dismissal

Native popovers and modal dialogs enter the browser's top layer instead of relying on arbitrary application z-index. A popover is not a dialog: overlay modality, Escape, focus restoration, light dismissal, and backdrop interaction are governed by the selected component's contract. A Drawer is still modal. Do not implement a generic fixed-position overlay or a global z-index controller just to unify them.

## Interaction and accessibility

Use the appropriate public trigger/content parts with accessible names, labels, descriptions, and keyboard operation. Keyboard focus must remain visible. Test Escape and focus return, pointer dismissal, nested surfaces, RTL, 320px reflow, enlarged text, reduced motion, and forced colors. Native platform behavior and component-specific policies take precedence over decorative examples.

## Ownership and further guidance

This utility teaches shared placement, design tokens, theming, layering, and customization. The component-specific pages remain the authority for each surface's props, composition, accessibility contract, state, and examples. The live React workbench uses the actual public React components; the Native Web example uses public VyrnForge Web styles and native popover semantics.

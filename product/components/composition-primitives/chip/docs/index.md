# Chip

Chip is a compact standalone label with optional native activation, navigation, persistent selection or a separate dismissal action. It is not an anchored Badge, an application status engine, or a collection controller.

## When to use

Use Chip for categories, visible status text, filters and removable selections. Use Badge for attached counts/dots, Button for ordinary commands, Checkbox or Radio for form choice, ToggleGroup for coordinated pressed choices and TagGroup for managed removable lists. Do not create a ChipGroup just to wrap chips; use Flow or a named native list.

## Appearance and content

Filled (default) and outlined use neutral, accent or danger semantic tokens. Small, medium (default) and large use compact control-derived sizing. Keep labels concise and meaningful without color. Neutral, accent and danger use the current shared theme roles; application branding can remap canonical semantic colors in an existing theme scope. Success, warning and info need shared semantic token admission before Chip can offer them. Leading Icon or Avatar and trailing artwork are decorative; the visible label carries the meaning. Full text remains in the DOM when constrained and truncated; allow wrapping where the label needs more room. Keep adequate space for removal targets and focus rings.

## Selection and dismissal

An actionable chip is a native type=button. A navigation chip is an actual anchor with href; it preserves link behavior, uses Enter rather than Space for navigation, and cannot also be a pressed/action button. Disabled navigation removes href and the tab stop while preserving a disabled link name. A link and removal button may be siblings. A selectable chip uses a native pressed button with a stable label, controlled or uncontrolled selected state and a visible selection mark. Removal is a separate native type=button, never nested in the primary action. Disabled suppresses both actions. The consumer commits removal or rejects it, owns filtering/business state, and determines whether a removal needs announcement. No animation delays the semantic change. Use TagGroup for managed collection focus, or restore focus to the next surviving control, previous control or stable collection/add control when a focused chip disappears.

## Accessibility

Static labels have no added role or tab stop. Native Enter/Space activates actionable, selectable and remove controls; Enter activates enabled links. Disabled links have no href and cannot navigate. Supply a meaningful visible label and a localized item-specific removal label. Slots must be noninteractive and redundant to the visible label. Do not hide or truncate the only way to discover a consequential label; allow wrapping or expose its full text in the surrounding content. Preserve visible focus, 24px minimum action targets, logical RTL order, text scaling, reduced motion and forced colors. A selected chip uses both aria-pressed and a visible mark, not color alone. Never add automatic live regions or group keyboard semantics.

## Boundaries

Chip has no collection policy, submit action, automatic deletion, new palette, new animation system or cross-framework runtime. The Web stylesheet supports the shared visual and semantic anatomy; the React integration provides the public convenience API. Other ports require separate implementation and evidence.

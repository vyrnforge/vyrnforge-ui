# ToggleButton

ToggleButton is a native `button` with a persistent `aria-pressed` state, for an independent toggleable command such as bold formatting. Keep its accessible name stable across on and off.

## Native semantics and behavior

Native Enter/Space activation, focus and disabled semantics remain browser-owned. React and Vue expose controlled/uncontrolled pressed state; Angular exposes a pressed model; Native Web uses `connectToggleButton`. The library derives `aria-pressed`, not custom checkbox or option roles.

## Sizing and styling

ToggleButton uses Button's `sm`, `md` and `lg` sizes via `data-vf-size`, defaulting to `md`, with independent inherited density. Load `@vyrnforge/web/styles/toggle-button.css`, which reuses the canonical Button CSS and shared tokens.

## Related controls and grouping

Button activates one action; ToggleButton toggles one pressed action. ToggleGroup owns coordinated single/multiple pressed choices, SegmentedControl an exclusive radio-like value, and Toolbar composite keyboard navigation. A Button Group is only a visual grouping recipe.

## Accessibility and evidence

Keep a stable authored accessible name; `aria-pressed` communicates state. Verify keyboard focus, disabled, forced colors, RTL and reduced motion. Automated checks do not establish human assistive-technology acceptance.

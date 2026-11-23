# ToggleButton

ToggleButton is a native `button` with a persistent `aria-pressed` state, for an independent toggleable command such as bold formatting. Keep its accessible name stable across on and off.

## Native semantics and behavior

Native Enter/Space activation, focus and disabled semantics remain browser-owned. React and Vue expose controlled/uncontrolled pressed state; Angular exposes a pressed model; Native Web uses `connectToggleButton`. The library derives `aria-pressed`, not custom checkbox or option roles.

## Sizing and styling

ToggleButton uses Button's `sm`, `md` and `lg` size axis via `data-vf-size`, defaulting to `md`, with inherited density. Load `@vyrnforge/web/styles/toggle-button.css`, which reuses canonical Button CSS and tokens.

For icon-only pressed commands use `iconOnly` in React/Vue, `iconOnly` on Angular `button[vfToggleButton]`, or `data-vf-icon-only` on the Native Web Button host. The square target shares Button's nominal regular-density 32/40/48 CSS px geometry, with a 2rem compact minimum. Provide a localized `aria-label` or `aria-labelledby`, keep its name stable while `aria-pressed` changes, and leave artwork decorative. Pressed has explicit accent-subtle and forced-colors styling.

## Related controls and grouping

Button activates one action; ToggleButton toggles one pressed action. ToggleGroup owns coordinated single/multiple pressed choices, SegmentedControl an exclusive radio-like value, and Toolbar composite keyboard navigation. A Button Group is only a visual grouping recipe. A ToggleGroup item can opt into the shared square icon-only CSS marker; it retains native-button Tab stops and the group's single/multiple selection contract. Toolbar owns composite command keyboard navigation.

## Accessibility and evidence

Keep a stable authored accessible name; `aria-pressed` communicates state. Verify keyboard focus, disabled, forced colors, RTL and reduced motion. Automated checks do not establish human assistive-technology acceptance.

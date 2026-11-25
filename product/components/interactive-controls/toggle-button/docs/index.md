# ToggleButton

Use ToggleButton for a command that stays on or off, such as showing archived items, pinning or bookmarking. Its stable accessible name identifies the action while `aria-pressed` communicates its current state.

## Native semantics and behavior

A ToggleButton is a native button. Enter, Space, pointer activation, focus and disabled behavior remain browser-owned. It does not represent a checkbox, a radio choice or a coordinated group.

## Icon-only toggles

Use square icon-only controls for familiar commands where space is limited, such as bookmarking an item. Use visible text for filters and other commands whose meaning is not apparent from an icon alone. Keep the accessible name stable with `aria-label` or `aria-labelledby`; decorative artwork does not provide the name. The `iconOnly` prop in React and Vue, the corresponding Angular input and the Native Web `data-vf-icon-only` marker share Button geometry.

## Icon with text

When an icon needs explanation, combine it with visible text inside an ordinary ToggleButton. Do not enable icon-only geometry when a visible label is present.

## Sizing and styling

Choose `sm`, `md` or `lg` (default `md`) independently of inherited density. The nominal regular-density square targets are 32, 40 and 48 CSS px, with the compact minimum of 2rem. The public stylesheet is `@vyrnforge/web/styles/toggle-button.css`. It uses the shared Button design tokens.

## Pressed and disabled states

Pressed describes the committed on/off state; disabled describes whether the command can be activated. A disabled toggle can remain pressed. Keep the same accessible name in both states, preserve native disabled behavior, and make the pressed state visible in normal and forced-colors modes.

## Controlled and uncontrolled state

Use uncontrolled state when the toggle owns its initial and subsequent state. Use controlled state when the application owns the committed value or needs to coordinate it with other UI. Native Web uses `connectToggleButton`; framework ports supply their documented state interfaces.

## Related controls and grouping

Use Button for one-shot actions, Button Group for arranging independent commands, ToggleGroup for coordinated pressed choices, SegmentedControl for an exclusive radio-like value, and Toolbar for composite command navigation.

## Accessibility and evidence

Keep the accessible name stable as `aria-pressed` changes. Preserve native keyboard activation and focus, disabled behavior, RTL, forced colors and reduced motion. Automated checks do not establish human assistive-technology acceptance.

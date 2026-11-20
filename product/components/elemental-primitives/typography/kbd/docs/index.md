# Kbd

Kbd indicates keyboard input, key names, and shortcuts in instructions. It is specialized noninteractive typography.

## When to use

- Show the keys people should press to perform an action, for example Ctrl and K in a search shortcut.
- Keep shortcut descriptions in ordinary readable prose, using Kbd only for the actual key names.
- Use separate Kbd elements for separate keys when that makes a combination clearer.

## When not to use

- Do not use Kbd as a clickable keycap, Button substitute, or shortcut listener. It has no activation or keyboard handling.
- Do not present a command to type in a terminal as a keyboard shortcut; use Code instead.
- Do not assume that a shortcut exists in the application merely because it is illustrated.

## Native baseline

Native `<kbd>` conveys user keyboard input. Styling adds the canonical `data-vf-kbd` hook without adding roles, focusability, events, or state.

## Visual styling

`@vyrnforge/web/styles/kbd.css` supplies the keycap treatment, monospace identity, and shared theme/forced-colors behavior. An optional Text variant can be composed on the same native element when Text CSS is available. The visual keycap does not become an interactive control.

## Accessibility

- Describe shortcuts in text and provide a discoverable alternative for application actions; keyboard-only shortcuts must not be the only available path.
- Localize key names and platform-specific instructions when relevant. Shortcuts may vary by operating system and keyboard layout.
- Preserve readable contrast, text enlargement, and understandable spacing between keys; never rely on the visual border alone to explain the action.
- Kbd does not handle keyboard events, announce key presses, or manage focus.

## Native Web

Use `<kbd data-vf-kbd>Ctrl</kbd>` and load `@vyrnforge/web/styles/kbd.css` (or the Web aggregate). React `Kbd` preserves the same native element and styling hooks.

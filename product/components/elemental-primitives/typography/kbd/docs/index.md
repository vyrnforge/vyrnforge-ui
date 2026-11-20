# Kbd

Kbd is specialized typography for native keyboard-input semantics.

Use native `kbd` semantics and load `@vyrnforge/web/styles/kbd.css`. Kbd presentation may compose with the shared Text typography hooks on the same native element. The Text role controls shared size/weight/line-height treatment; Kbd retains monospace identity and keycap presentation.

Kbd adds no keyboard behavior or shortcut handling.

## React integration

`@vyrnforge/react/kbd` exposes native `<kbd>` through the same `data-vf-kbd` hook and `@vyrnforge/web/styles/kbd.css`. It preserves ordinary native HTML/ARIA props and refs, with optional shared Text variant hooks if `text.css` is loaded. React does not add keyboard events or interactive state.

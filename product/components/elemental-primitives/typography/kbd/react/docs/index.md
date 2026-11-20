# React Kbd

`Kbd` is a noninteractive wrapper around the native `kbd` element. React only maps native attributes/ref/children to the canonical Web hook; it does not execute a keyboard shortcut or synthesize button/keyboard state.

## React setup

Load the canonical stylesheet **once in the application entrypoint**, not inside every component or example:

```ts
import '@vyrnforge/web/styles.css';
```

This is the **current explicit loading model**; importing a React component does not automatically load its CSS. Applications optimizing their CSS payload can instead import selected granular Web styles at their entrypoint.

```tsx
import { Kbd } from '@vyrnforge/react/kbd';
<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
```

Use `kbd` only for keyboard input or key names, not as an interactive keycap button. The public `variant` option applies existing Text styling hooks when Text styling is loaded through the application-wide stylesheet (or equivalent granular Text CSS). The native element, monospace identity, visual keycap, inherited theme and forced-colors treatment remain shared with Native Web.

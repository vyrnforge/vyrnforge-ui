# React Kbd

`Kbd` is a noninteractive wrapper around the native `kbd` element. React only maps native attributes/ref/children to the canonical Web hook; it does not execute a keyboard shortcut or synthesize button/keyboard state.

## React setup

```tsx
import { Kbd } from '@vyrnforge/react/kbd';
import '@vyrnforge/web/styles/kbd.css';

<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
```

Use `kbd` only for keyboard input or key names, not as an interactive keycap button. The public `variant` option applies existing Text styling hooks when `@vyrnforge/web/styles/text.css` is loaded as well. The native element, monospace identity, visual keycap, inherited theme and forced-colors treatment remain shared with Native Web.

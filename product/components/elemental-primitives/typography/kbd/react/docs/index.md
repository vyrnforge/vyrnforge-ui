# React Kbd

Use `Kbd` to describe a key or shortcut in React content. It renders native `<kbd>` and never installs shortcut behavior.

## React setup

```tsx
import { Kbd } from '@vyrnforge/react/kbd';

<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
```

The shortcut is documentation text; the consuming application still owns its actual keyboard handlers and an accessible non-shortcut action.

## Semantic authoring

Use native text and separate Kbd elements for keys within a sequence. Kbd is not an interactive button and does not accept a special keyboard contract beyond normal native HTML attributes and refs. Keep any application-specific platform labels, translated instructions, and discoverable action alternatives outside the typography component.

## Styling and server rendering

CSS-aware browser bundles resolving the `browser` export condition include the canonical Web Kbd CSS with the React entrypoint. Plain Node/SSR imports remain CSS-free; the consuming SSR framework must include extracted client CSS in HTML. Bundlers unable to extract the component CSS can instead import the aggregate once at application entry:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is not loaded automatically. The public `variant` uses the shared Text hooks where Text styling is available, while the native keycap and forced-colors treatment remain Web-owned.

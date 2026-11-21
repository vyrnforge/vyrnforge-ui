# React Divider

Render a straight horizontal or vertical line with optional readable text. The React wrapper uses the same native span semantics and shared CSS as Native Web.

## React setup

```tsx
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/divider.css';

<Divider />
<Divider orientation="vertical" />
<Divider>OR</Divider>
<Divider textAlign="start">Before</Divider>
<Divider textAlign="end">After</Divider>
<Divider orientation="vertical" textAlign="center">Next</Divider>
<Divider orientation="vertical" textDirection="horizontal">OR</Divider>
<Divider orientation="vertical" textDirection="bottom-to-top">Previous</Divider>
```

No provider, wrapper div, CSS-in-JS system or extra runtime is required. Use `<hr />` directly for a semantic thematic break.

## React authoring

Provide simple text or a number between the Divider tags. Text alignment is `textAlign="start" | "center" | "end"`; center is the default for both orientations. Without text, Divider keeps the existing full 1px rule. With text, the host renders two CSS-painted line segments and an inner `span` for the text. The vertical variant has three ways to draw its text through `textDirection`: `top-to-bottom` (existing default), `bottom-to-top` (reverse vertical reading), and `horizontal` (upright horizontal label interrupting a vertical line). This changes only the label's visual direction, not `textAlign` (start/center/end), source order, semantic language direction or ARIA. Vertical lines need a parent with sufficient height. Keep labels concise and let application layout determine actual space. The component forwards an `HTMLSpanElement` ref and ordinary nonsemantic native attributes (e.g. `className`, `style`, `id`, `data-*`). Interactive children are deliberately unsupported.

## React accessibility

Without a label, the line is `aria-hidden="true"`. With text (including numeric `0`), the host is **not** `aria-hidden`, so assistive technology can read the label. Neither variant introduces `role="separator"`, `aria-orientation`, focus, or keyboard behavior. A labeled Divider is not a substitute for a structural heading or a labeled form group.

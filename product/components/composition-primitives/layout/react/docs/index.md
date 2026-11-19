# React Layout

## React installation and first use

Load `@vyrnforge/web/styles/layout.css` once from your React app's entrypoint, then import `Flow` and `AutoGrid` from `@vyrnforge/react/layout` or the root `@vyrnforge/react` export. Both are components, not JSX examples for raw data-attribute configuration. No other layout package or provider is needed.

## Default-first React example

```tsx
import { Flow } from '@vyrnforge/react/layout';
import { Input } from '@vyrnforge/react/input';
import { Text } from '@vyrnforge/react/text';

<Flow>
  <label htmlFor="contact-email">Contact email</label>
  <Input id="contact-email" type="email" aria-describedby="contact-email-help" />
  <Text as="p" id="contact-email-help">Used for account notifications.</Text>
</Flow>
```

There is no inline width, margin, gap, font or input-size styling here. Import the canonical Web `foundation.css`, `layout.css`, `input.css` and `text.css` at app startup (or the documented aggregate stylesheet). The default Flow gap is comfortable md; an inherited `data-vf-density="compact"` scope changes the omitted Flow/AutoGrid gap to sm and the eligible Input geometry to the compact control profile. Style only genuine consuming-application needs; explicit `gap` and `minItemSize` remain deliberate overrides. The label/help IDs remain necessary accessibility relationships, not styling props.

## React Flow props

`Flow` accepts `direction="block|inline"` (default block), `wrap="nowrap|wrap"` (nowrap default; wraps only inline flows), `gap` (token spacing), `align="start|center|end|stretch|baseline"`, `justify="start|center|end|space-between"`, `as` (native structural element; div default), `className`, `style`, children, native props, and a forwarded ref. The component emits the canonical Web `data-vf-flow` hooks and never introduces roles or managed keyboard interactions.

## React AutoGrid props

`AutoGrid` accepts `gap` and `minItemSize` (CSS length such as `12rem` or `240px`, 16rem default), `as` (div by default), semantic HTML props and a forwarded ref. `minItemSize` maps to `--vf-auto-grid-min-item-size`; it does not add JavaScript breakpoints or duplicate the Web algorithm.

## Semantic layout and accessibility

Prefer `as="nav"` with `aria-label` for navigation groups, `as="ul"` plus `li` for collections, and native `fieldset` plus `legend` for named radio groups. Component props cannot add form labels, group semantics, focus management or validation automatically. Keep meaningful source/tab order and test narrow widths, RTL, themes and forced colors.

## Migration for React consumers

Old Stack becomes `<Flow>`; Inline becomes `<Flow direction="inline">`; Cluster becomes `<Flow direction="inline" wrap="wrap">`. Old AutoGrid wrappers become `<AutoGrid minItemSize="12rem">`. Do not reintroduce Container, ControlGroup, Surface, Box, Flex or Card abstractions. React apps using raw `data-vf-*` remain compatible with the CSS source; migrate to the components for a more concise API. Angular/Vue/Elements consumers are unaffected.

## SSR, hydration and package boundary

Both components forward host refs without effects, browser globals, global providers or mount-time layout calculations. They output native HTML attributes in SSR; React hydrates the same markup. Their import path is `@vyrnforge/react/layout`, and their visual requirements are supplied by the public Web stylesheet. This private rebuild makes no stable release or blanket accessibility claim.

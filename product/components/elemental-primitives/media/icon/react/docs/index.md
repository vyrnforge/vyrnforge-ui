# React Icon

Use the public React `Icon` renderer with a typed `IconDefinition` from the optional glyph catalog or your own `defineIcon` result. Icon is a visual SVG primitive, not an interactive control.

## React setup

```tsx
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

<Icon icon={bookmarkIcon} label="Bookmark" />
```

The explicit `label` is appropriate only when an icon independently conveys meaning. For decorative icons inside labeled controls, omit `label` so the SVG stays hidden from assistive technology. Use the shared React overview for stylesheet delivery and SSR/hydration setup.

## Simple custom SVG

For a reusable icon in React, one VyrnForge import and one function call is enough:

```tsx
import { createSvgIcon } from '@vyrnforge/react/icon';

export const SparkleIcon = createSvgIcon(
  <path d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"
    fill="none" stroke="currentColor" strokeWidth="1.75" />
);
```

Use `<SparkleIcon />` anywhere. `<SparkleIcon size="lg" />` and `<SparkleIcon label="Sparkle" />` work without custom prop types or an extra wrapper component. Once defined, consuming files only need `import { SparkleIcon } from './icons'`. The full runnable example includes `createRoot` only to mount its standalone preview; application components do not need that setup.

For a one-off shape, import only `SvgIcon` and write `<SvgIcon><path d="..." fill="currentColor" /></SvgIcon>` directly. Both choices supply a default 24×24 viewBox, medium sizing, the canonical Icon CSS hooks, and decorative accessibility by default. Override `viewBox` for other canvas sizes, use `label` only when artwork conveys standalone meaning, and keep `stroke="currentColor"` or `fill="currentColor"` for inherited theme color. The public `size` choices are `sm`, `md`, and `lg`.

For existing catalog glyphs or cross-framework reusable outlined/filled and rounded/sharp artwork, use `Icon` plus `defineIcon`. The React-only `createSvgIcon` does not generate those authored variants or introduce a second styling system.

## React authoring

Pass an `IconDefinition` through `icon`; optional `variant`, `shape` and `size` change only the shared SVG visual treatment. Ordinary applicable SVG attributes and a ref may be passed to the SVG host, while the component owns its accessibility role, `aria-hidden`, `aria-label` and focusable state. For an icon-only action, place a decorative Icon inside a natively operable, explicitly named Button. The component itself never registers pointer or keyboard actions.

## React color and theming

Use `tone` on `Icon`, `SvgIcon`, or a component returned by `createSvgIcon` for a simple semantic, theme-aware SVG color. The shape should use `stroke="currentColor"` or `fill="currentColor"`. No manual CSS variable or wrapper is needed:

```tsx
<Icon icon={bookmarkIcon} tone="accent" />
<Icon icon={bookmarkIcon} tone="danger" />
<SparkleIcon size="lg" tone="primary" />
```

`primary` and `accent` resolve to the same canonical Web accent role; `secondary` and `muted` share the canonical muted-text role. The role is resolved through CSS inheritance for built-in light/dark/system modes and custom theme scopes, not hardcoded React palette values. For custom styling outside the `tone` API, import `colors` from `@vyrnforge/react` and use its token references. `ThemeScope` supports scoped semantic overrides without another styling runtime.

Multicolor path markup may use explicit shape colors; `tone` only changes currentColor-based paths. Do not encode important meaning in color alone: pair status with text or a meaningful accessible name. See **React colors & themes** in the React foundation guide.

## Inline SVG tags

For one-off artwork, React can render native `<svg>`, `<path>`, `<circle>` and other SVG JSX tags directly. Set a `viewBox`, use `stroke="currentColor"` or `fill="currentColor"` for theme-aware outlines/fills, and add `data-vf-icon` with `data-vf-size` to adopt the canonical Web Icon sizing. Explicitly load `@vyrnforge/web/styles/icon.css` in builds that do not already deliver it. A meaningful standalone SVG needs an accessible name and image semantics; a decorative SVG uses `aria-hidden="true"` and `focusable="false"`.

A JSX child such as `<Icon><path /></Icon>` is **not** the `Icon` API: `Icon` accepts an `IconDefinition` via its required `icon` prop and generates its own path elements. Use `<SvgIcon><path /></SvgIcon>` for easy React-authored shapes; use `defineIcon` for shared variant/shape artwork across VyrnForge framework ports. Native SVG tags remain appropriate without any wrapper. Multi-color direct SVG is possible via per-shape theme tokens, but ensure contrast and do not claim that its artwork automatically supplies accessible meaning.

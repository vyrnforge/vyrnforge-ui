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

If you already have an SVG path, use `SvgIcon` and write the shape directly. It supplies a default `viewBox="0 0 24 24"`, medium size, shared Icon CSS hooks, and decorative accessibility without extra setup:

```tsx
import { SvgIcon } from '@vyrnforge/react/icon';

<SvgIcon>
  <path d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"
    fill="none" stroke="currentColor" strokeWidth="1.75" />
</SvgIcon>
```

Set `size="sm" | "md" | "lg"` only when needed; pass `label` if the SVG itself conveys standalone meaning. Set `viewBox` only for artwork that is not drawn on a 24×24 canvas. Other ordinary SVG attributes, `className`, `style`, and an SVG ref remain available. A custom application component can simply return `<SvgIcon {...props}><path ... /></SvgIcon>` and reuse it anywhere. For theme-aware colors, use `currentColor` inside the artwork and a public VyrnForge CSS token on the enclosing text context or `style`.

This wrapper is a React authoring convenience, not a different visual system or an alternative framework-neutral definition format. For reusable authored variant/shape artwork across frameworks, continue using `defineIcon` with `Icon`.

## React authoring

Pass an `IconDefinition` through `icon`; optional `variant`, `shape` and `size` change only the shared SVG visual treatment. Ordinary applicable SVG attributes and a ref may be passed to the SVG host, while the component owns its accessibility role, `aria-hidden`, `aria-label` and focusable state. For an icon-only action, place a decorative Icon inside a natively operable, explicitly named Button. The component itself never registers pointer or keyboard actions.

## React color and theming

`Icon` uses `currentColor`, so color comes from its owning element rather than an Icon-specific palette. Apply a public color token to a parent context; the same glyph will follow the light/dark theme. For example, wrap `<Icon icon={bookmarkIcon} />` in `<span style={{ color: 'var(--vf-color-accent-background)' }}>`. The CSS contract on `[data-vf-icon]` inherits this context, so setting an arbitrary `color` directly on Icon is not the preferred styling contract. Do not encode important meaning in color alone; pair state or status with text or an accessible name.

## Inline SVG tags

For one-off artwork, React can render native `<svg>`, `<path>`, `<circle>` and other SVG JSX tags directly. Set a `viewBox`, use `stroke="currentColor"` or `fill="currentColor"` for theme-aware outlines/fills, and add `data-vf-icon` with `data-vf-size` to adopt the canonical Web Icon sizing. Explicitly load `@vyrnforge/web/styles/icon.css` in builds that do not already deliver it. A meaningful standalone SVG needs an accessible name and image semantics; a decorative SVG uses `aria-hidden="true"` and `focusable="false"`.

A JSX child such as `<Icon><path /></Icon>` is **not** the `Icon` API: `Icon` accepts an `IconDefinition` via its required `icon` prop and generates its own path elements. Use `<SvgIcon><path /></SvgIcon>` for easy React-authored shapes; use `defineIcon` for shared variant/shape artwork across VyrnForge framework ports. Native SVG tags remain appropriate without any wrapper. Multi-color direct SVG is possible via per-shape theme tokens, but ensure contrast and do not claim that its artwork automatically supplies accessible meaning.
